// Solo se puede reactivar una cancelada con el período todavía vigente (no hay cobro nuevo: con el
// período vencido hay que suscribirse de nuevo, por `iniciar-suscripcion`). La transición se valida
// del lado del servidor, igual que `cancelar-suscripcion`.
//
// Orden importante: primero se intenta el UPDATE en la base, apoyado en el índice único de "una fila
// viva por persona" (migración 0006) como candado atómico; recién si eso funciona se llama a Mercado
// Pago. Al revés (MP primero) se podía reactivar un preapproval viejo mientras ya existía uno nuevo
// vivo: quedaban los dos cobrando, y el viejo, en estado 'cancelada', ya no lo encontraba
// `cancelar-suscripcion` (que busca 'activa') — quedaba incancelable desde el sitio. Encontrado por la
// auditoría de verificación de la Tanda de Mercado Pago.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

const ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");

const error = (mensaje: string, status = 409) => Response.json({ ok: false, mensaje }, { status });
// Argentina no tiene horario de verano: UTC-3 todo el año, la misma zona que usa `tiene_acceso()`.
const hoyISO = () => new Date(Date.now() - 3 * 3_600_000).toISOString().slice(0, 10);

// Ver el comentario del mismo helper en `cancelar-suscripcion`.
function esSesionDeRecuperacion(claims: Record<string, unknown>): boolean {
  const amr = claims?.amr;
  return Array.isArray(amr) && amr.some((e) => (e as { method?: string })?.method === "recovery");
}

export default {
  fetch: withSupabase({ auth: "user" }, async (_req, ctx) => {
    if (!ACCESS_TOKEN) {
      console.error("[reactivar-suscripcion] falta MP_ACCESS_TOKEN");
      return error("No pudimos hacerlo ahora. Probá de nuevo en un rato.", 500);
    }
    if (esSesionDeRecuperacion(ctx.userClaims!)) {
      return error("Iniciá sesión de nuevo para hacer esto.", 403);
    }
    const userId = ctx.userClaims!.id as string;

    // Puede haber más de una fila 'cancelada' vieja (el índice único de la 0006 no las cuenta como
    // "vivas", así que no impide acumularlas): se toma la más reciente.
    const { data: candidatas, error: errorLectura } = await ctx.supabaseAdmin
      .from("suscripciones")
      .select("id, preapproval_id, acceso_hasta")
      .eq("user_id", userId)
      .eq("estado", "cancelada")
      .order("ultimo_evento", { ascending: false })
      .limit(1);
    if (errorLectura) return error("No pudimos hacerlo ahora. Probá de nuevo en un rato.", 500);
    const sub = candidatas?.[0];
    if (!sub || !sub.acceso_hasta || sub.acceso_hasta < hoyISO()) {
      return error("No pudimos hacerlo ahora. Probá de nuevo en un rato.");
    }

    // La base primero: si ya existe otra fila viva (la persona se volvió a suscribir mientras tanto),
    // el índice único de la 0006 hace fallar este update con 23505, antes de tocar Mercado Pago.
    const { data: actualizada, error: errorUpdate } = await ctx.supabaseAdmin
      .from("suscripciones")
      .update({ estado: "activa", acceso_hasta: null, ultimo_evento: new Date().toISOString() })
      .eq("id", sub.id)
      .eq("estado", "cancelada")
      .select("id");
    if (errorUpdate) {
      if (errorUpdate.code === "23505") return error("Ya tenés una suscripción en curso.", 409);
      console.error("[reactivar-suscripcion] update suscripciones", errorUpdate);
      return error("No pudimos hacerlo ahora. Probá de nuevo en un rato.", 500);
    }
    if (!actualizada?.length) return error("No pudimos hacerlo ahora. Probá de nuevo en un rato.");

    // La pausó `cancelar-suscripcion` (status "paused"), nunca "cancelled": por eso esto puede volver
    // a "authorized". Ver el comentario de esa función.
    const resp = await fetch(`https://api.mercadopago.com/preapproval/${sub.preapproval_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ACCESS_TOKEN}` },
      body: JSON.stringify({ status: "authorized" }),
    });
    if (!resp.ok) {
      console.error("[reactivar-suscripcion] MP respondió", resp.status, await resp.text());
      // La base ya había quedado en 'activa': volver atrás para no mentir el acceso.
      await ctx.supabaseAdmin
        .from("suscripciones")
        .update({ estado: "cancelada", acceso_hasta: sub.acceso_hasta, ultimo_evento: new Date().toISOString() })
        .eq("id", sub.id)
        .eq("estado", "activa");
      return error("No pudimos hacerlo ahora. Probá de nuevo en un rato.", 502);
    }

    return Response.json({ ok: true });
  }),
};
