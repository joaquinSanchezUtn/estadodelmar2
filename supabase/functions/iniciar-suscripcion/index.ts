// Crea la suscripción (preapproval) en Mercado Pago y devuelve la URL del checkout alojado por MP.
// No manda card_token_id: así MP arma un `init_point` en vez de cobrar directo, y quien se suscribe
// termina de autorizar del lado de MP. El estado real después lo escribe el webhook, nunca esta
// función a mano: acá solo se guarda 'iniciada' para tener la fila desde el principio.
//
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

const ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://estado-del-mar.vercel.app";
// [PRECIO]: sigue sin decidirse (ver CLAUDE.md). Sin fallback a propósito (auditoría de la Tanda de
// Mercado Pago): si el secreto no está, mejor que falle claro a que cobre un número viejo sin avisar.
const PRECIO = Deno.env.get("MP_PRECIO_ARS");

const error = (mensaje: string, status = 500) => Response.json({ ok: false, mensaje }, { status });
// Solo puede haber una fila "viva" por persona a la vez (índice único, migración 0006).
const ESTADOS_VIVOS = ["iniciada", "pendiente", "activa", "en_gracia"];

// Un JWT de recuperación de contraseña no es una sesión plena (ver migración 0003): sin este chequeo,
// alguien con un enlace de recuperación ajeno podía iniciar una suscripción a nombre de otra persona.
// Esta función usa `ctx.supabaseAdmin` (service_role), que no pasa por RLS ni por
// `sesion_de_recuperacion()`: hay que repetir el chequeo acá, a mano. Encontrado por la auditoría de
// verificación de la Tanda de Mercado Pago.
function esSesionDeRecuperacion(claims: Record<string, unknown>): boolean {
  const amr = claims?.amr;
  return Array.isArray(amr) && amr.some((e) => (e as { method?: string })?.method === "recovery");
}

export default {
  fetch: withSupabase({ auth: "user" }, async (_req, ctx) => {
    if (!ACCESS_TOKEN || !PRECIO) {
      console.error("[iniciar-suscripcion] falta MP_ACCESS_TOKEN o MP_PRECIO_ARS");
      return error("No pudimos iniciar la suscripción. Probá de nuevo en un rato.");
    }
    if (esSesionDeRecuperacion(ctx.userClaims!)) {
      return error("Iniciá sesión de nuevo para hacer esto.", 403);
    }

    const userId = ctx.userClaims!.id as string;
    const email = ctx.userClaims!.email as string;

    // Con una suscripción en curso, no se crea otra: evita duplicados si alguien vuelve atrás en el
    // navegador o aprieta el botón dos veces.
    const { data: existente, error: errorLectura } = await ctx.supabaseAdmin
      .from("suscripciones")
      .select("id")
      .eq("user_id", userId)
      .in("estado", ESTADOS_VIVOS)
      .maybeSingle();
    if (errorLectura) return error("No pudimos hacerlo ahora. Probá de nuevo en un rato.");
    if (existente) return error("Ya tenés una suscripción en curso.", 409);

    const resp = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ACCESS_TOKEN}` },
      body: JSON.stringify({
        reason: "Estado del mar — suscripción mensual",
        external_reference: userId,
        payer_email: email,
        back_url: `${SITE_URL}/suscripcion/resultado`,
        auto_recurring: { frequency: 1, frequency_type: "months", transaction_amount: Number(PRECIO), currency_id: "ARS" },
      }),
    });
    if (!resp.ok) {
      console.error("[iniciar-suscripcion] MP respondió", resp.status, await resp.text());
      return error("No pudimos iniciar la suscripción. Probá de nuevo en un rato.", 502);
    }
    const preapproval = await resp.json();

    const { error: errorInsert } = await ctx.supabaseAdmin.from("suscripciones").insert({
      user_id: userId,
      preapproval_id: preapproval.id,
      estado: "iniciada",
    });
    if (errorInsert) {
      // 23505: el índice único de "una fila viva por persona" saltó por una carrera (el chequeo de
      // arriba la perdió). El preapproval que se acaba de crear en MP queda huérfano en 'pending':
      // no cobra nada porque nadie lo va a autorizar.
      if (errorInsert.code === "23505") return error("Ya tenés una suscripción en curso.", 409);
      console.error("[iniciar-suscripcion] insert suscripciones", errorInsert);
      return error("No pudimos guardar la suscripción. Probá de nuevo en un rato.");
    }

    return Response.json({ url: preapproval.init_point, externo: true });
  }),
};
