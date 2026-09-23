// Devuelve la URL del checkout de Mercado Pago para que la persona cargue una tarjeta nueva. MP no
// tiene un endpoint separado para "solo cambiar la tarjeta": es el mismo checkout de la suscripción
// (`/subscriptions/checkout?preapproval_id=...`), al que MP reconoce que ya existe una suscripción
// para ese id y ofrece actualizar el medio de pago en vez de crear una nueva.
//
// OJO: esto no está probado contra un cambio de tarjeta real todavía (falta esa parte del flujo en
// el sandbox); antes de confiar en esto para producción, probarlo de punta a punta.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

const error = (mensaje: string, status = 409) => Response.json({ ok: false, mensaje }, { status });

// Ver el comentario del mismo helper en `cancelar-suscripcion`.
function esSesionDeRecuperacion(claims: Record<string, unknown>): boolean {
  const amr = claims?.amr;
  return Array.isArray(amr) && amr.some((e) => (e as { method?: string })?.method === "recovery");
}

export default {
  fetch: withSupabase({ auth: "user" }, async (_req, ctx) => {
    if (esSesionDeRecuperacion(ctx.userClaims!)) {
      return error("Iniciá sesión de nuevo para hacer esto.", 403);
    }
    const userId = ctx.userClaims!.id as string;

    // 'en_gracia' también puede cambiar la tarjeta: es justo el camino de vuelta de un cobro
    // rebotado (ver SuscripcionEnGracia.tsx).
    const { data: sub, error: errorLectura } = await ctx.supabaseAdmin
      .from("suscripciones")
      .select("preapproval_id")
      .eq("user_id", userId)
      .in("estado", ["activa", "en_gracia"])
      .maybeSingle();
    if (errorLectura) return error("No pudimos hacerlo ahora. Probá de nuevo en un rato.", 500);
    if (!sub) return error("No pudimos hacerlo ahora. Probá de nuevo en un rato.");

    const url = `https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_id=${sub.preapproval_id}`;
    return Response.json({ url, externo: true });
  }),
};
