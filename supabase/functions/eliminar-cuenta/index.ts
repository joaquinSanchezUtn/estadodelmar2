// Da de baja la cuenta de quien la pide, en este orden (el que fijó la auditoría de seguridad, ver
// CLAUDE.md): 1) cancelar en Mercado Pago TODA preapproval que tenga, sin mirar el estado local (una
// 'vencida' puede seguir pausada con reintentos, una 'cancelada' puede reactivarse); 2) cerrar todas sus
// sesiones; 3) recién ahí borrar el usuario. Si el paso 1 falla no se borra nada: borrar la cuenta y
// que Mercado Pago siga cobrando sería el peor resultado posible.
//
// Las filas de `suscripciones` no se borran: el `ON DELETE SET NULL` de `user_id` las deja sin dueño,
// para poder conciliar un webhook que llegue tarde. El perfil se va en cascada con el usuario.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@1.9.0";

const ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");

const error = (mensaje: string, status = 409) => Response.json({ ok: false, mensaje }, { status });
const FALLO = "No pudimos eliminar tu cuenta ahora. No se borró nada y tu suscripción sigue igual. Probá de nuevo en un rato o escribinos.";

// Argentina no tiene horario de verano: UTC-3 todo el año, igual que `tiene_acceso()`.
const hoyISO = () => new Date(Date.now() - 3 * 3_600_000).toISOString().slice(0, 10);

// Un enlace de "recuperar contraseña" no es una sesión plena (migración 0003): con uno ajeno no se
// puede borrar la cuenta de otra persona.
function esSesionDeRecuperacion(claims: Record<string, unknown>): boolean {
  const amr = claims?.amr;
  return Array.isArray(amr) && amr.some((e) => (e as { method?: string })?.method === "recovery");
}

async function cancelarEnMercadoPago(preapprovalId: string): Promise<boolean> {
  const cabeceras = { "Content-Type": "application/json", Authorization: `Bearer ${ACCESS_TOKEN}` };
  const actual = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, { headers: cabeceras });
  // 404: Mercado Pago no la conoce (nunca se completó el checkout): no hay nada que pueda cobrar.
  if (actual.status === 404) return true;
  if (!actual.ok) {
    console.error("[eliminar-cuenta] GET preapproval", preapprovalId, actual.status, await actual.text());
    return false;
  }
  if ((await actual.json()).status === "cancelled") return true;
  const resp = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
    method: "PUT",
    headers: cabeceras,
    body: JSON.stringify({ status: "cancelled" }),
  });
  if (!resp.ok) console.error("[eliminar-cuenta] PUT preapproval cancelled", preapprovalId, resp.status, await resp.text());
  return resp.ok;
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (!ACCESS_TOKEN) {
      console.error("[eliminar-cuenta] falta MP_ACCESS_TOKEN");
      return error(FALLO, 500);
    }
    if (esSesionDeRecuperacion(ctx.userClaims!)) return error("Iniciá sesión de nuevo para hacer esto.", 403);
    const userId = ctx.userClaims!.id as string;

    // La cuenta administradora no se borra desde acá: dejaría el sitio sin nadie que lo maneje.
    const { data: perfil } = await ctx.supabaseAdmin.from("profiles").select("role").eq("id", userId).maybeSingle();
    if (perfil?.role === "admin") return error("La cuenta administradora no se puede eliminar desde Mi cuenta.", 403);

    // 1) Mercado Pago, todas las que tenga.
    const { data: filas, error: errorLectura } = await ctx.supabaseAdmin
      .from("suscripciones")
      .select("id, preapproval_id, estado")
      .eq("user_id", userId);
    if (errorLectura) return error(FALLO, 500);
    for (const fila of filas ?? []) {
      if (fila.preapproval_id && !(await cancelarEnMercadoPago(fila.preapproval_id))) return error(FALLO, 502);
    }
    // Las que seguían vivas quedan cerradas hoy: si llega un webhook tarde, ya no hay acceso que revivir.
    const vivas = (filas ?? []).filter((f) => f.estado !== "cancelada" && f.estado !== "vencida").map((f) => f.id);
    if (vivas.length) {
      const { error: errorCierre } = await ctx.supabaseAdmin
        .from("suscripciones")
        .update({ estado: "cancelada", acceso_hasta: hoyISO(), ultimo_evento: new Date().toISOString() })
        .in("id", vivas);
      if (errorCierre) console.error("[eliminar-cuenta] no se pudieron cerrar las filas", errorCierre);
    }

    // 2) Todas las sesiones, en todos los dispositivos. El JWT ya emitido vale hasta que vence (una
    // hora como mucho), pero al borrar el usuario su perfil desaparece y `tiene_acceso()` da falso.
    const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { error: errorSesiones } = await ctx.supabaseAdmin.auth.admin.signOut(jwt, "global");
    if (errorSesiones) console.error("[eliminar-cuenta] signOut global", errorSesiones);

    // 3) El usuario (y en cascada su perfil, sus identidades y sus factores).
    const { error: errorBorrado } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId);
    if (errorBorrado) {
      console.error("[eliminar-cuenta] deleteUser", errorBorrado);
      return error("Cancelamos tu suscripción, pero no pudimos terminar de borrar la cuenta. Escribinos y lo completamos.", 500);
    }

    return Response.json({ ok: true });
  }),
};
