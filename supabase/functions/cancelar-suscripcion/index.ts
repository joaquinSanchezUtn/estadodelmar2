// La baja no corta el acceso: sigue hasta el fin del período ya pago (`proximo_cobro`, que pasa a
// ser `acceso_hasta`). La transición se valida acá, del lado del servidor (solo desde 'activa'):
// el cliente no decide esto, solo lo pide.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@1.9.0";

const ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");

const error = (mensaje: string, status = 409) => Response.json({ ok: false, mensaje }, { status });

// Argentina no tiene horario de verano: UTC-3 todo el año, la misma zona que usa `tiene_acceso()` en
// la base para decidir hasta cuándo dura el acceso.
const hoyISO = () => new Date(Date.now() - 3 * 3_600_000).toISOString().slice(0, 10);

// Un JWT de recuperación de contraseña no es una sesión plena (ver migración 0003): sin este chequeo,
// alguien con un enlace de recuperación ajeno (reenviado, casilla compartida) podía dar de baja la
// suscripción de otra persona. Esta función usa `ctx.supabaseAdmin` (service_role), que no pasa por
// RLS ni por `tiene_acceso()`/`sesion_de_recuperacion()`: hay que repetir el mismo chequeo acá, a mano,
// leyendo el `amr` del JWT igual que hace esa función en la base. Encontrado por la auditoría de
// verificación de la Tanda de Mercado Pago.
function esSesionDeRecuperacion(claims: Record<string, unknown>): boolean {
  const amr = claims?.amr;
  return Array.isArray(amr) && amr.some((e) => (e as { method?: string })?.method === "recovery");
}

export default {
  fetch: withSupabase({ auth: "user" }, async (_req, ctx) => {
    if (!ACCESS_TOKEN) {
      console.error("[cancelar-suscripcion] falta MP_ACCESS_TOKEN");
      return error("No pudimos hacerlo ahora. Probá de nuevo en un rato.", 500);
    }
    if (esSesionDeRecuperacion(ctx.userClaims!)) {
      return error("Iniciá sesión de nuevo para hacer esto.", 403);
    }
    const userId = ctx.userClaims!.id as string;

    // Como solo puede haber una fila "viva" por persona (índice único, migración 0006), alcanza con
    // buscar la que está activa: no hace falta ordenar por fecha y quedarse con "la última".
    const { data: sub, error: errorLectura } = await ctx.supabaseAdmin
      .from("suscripciones")
      .select("id, preapproval_id, proximo_cobro")
      .eq("user_id", userId)
      .eq("estado", "activa")
      .maybeSingle();
    if (errorLectura) return error("No pudimos hacerlo ahora. Probá de nuevo en un rato.", 500);
    if (!sub) return error("No pudimos hacerlo ahora. Probá de nuevo en un rato.");

    // Primero la base y después Mercado Pago, como `reactivar-suscripcion`. Al revés había una carrera:
    // el webhook de "paused" podía llegar antes de este update, encontrar la fila todavía 'activa' y
    // pasarla a 'vencida' sin acceso, y la persona perdía los días ya pagos (auditoría del 2026-10-01).
    // Con la fila ya en 'cancelada', ese webhook sabe que la pausa la pidió ella.
    //
    // Puede no haber `proximo_cobro` todavía (el webhook de autorización no llegó, caso raro): en ese
    // caso no queda acceso extra, se corta hoy. Guardado con `.eq('estado', 'activa')`: si el webhook
    // cambió la fila justo en el medio (un cobro rebotó), no se pisa nada.
    const accesoHasta = sub.proximo_cobro ?? hoyISO();
    const { data: actualizada, error: errorUpdate } = await ctx.supabaseAdmin
      .from("suscripciones")
      .update({ estado: "cancelada", acceso_hasta: accesoHasta, ultimo_evento: new Date().toISOString() })
      .eq("id", sub.id)
      .eq("estado", "activa")
      .select("id");
    if (errorUpdate) {
      console.error("[cancelar-suscripcion] update suscripciones", errorUpdate);
      return error("No pudimos hacerlo ahora. Probá de nuevo en un rato.", 500);
    }
    if (!actualizada?.length) {
      return error("Tu suscripción cambió mientras hacíamos esto. Volvé a mirar el estado y probá de nuevo.", 409);
    }

    // "paused" y no "cancelled": en Mercado Pago un preapproval cancelado es terminal (nunca vuelve a
    // "authorized"), y acá la persona tiene que poder arrepentirse mientras el período siga pago —
    // ver `reactivar-suscripcion`.
    const resp = await fetch(`https://api.mercadopago.com/preapproval/${sub.preapproval_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ACCESS_TOKEN}` },
      body: JSON.stringify({ status: "paused" }),
    });
    if (!resp.ok) {
      console.error("[cancelar-suscripcion] MP respondió", resp.status, await resp.text());
      // Mercado Pago no pausó: si la fila quedara 'cancelada', le seguirían cobrando sin que el sitio
      // lo supiera. Se vuelve a 'activa' (solo si nadie la cambió mientras tanto) y se avisa.
      const { error: errorReversa } = await ctx.supabaseAdmin
        .from("suscripciones")
        .update({ estado: "activa", acceso_hasta: null, ultimo_evento: new Date().toISOString() })
        .eq("id", sub.id)
        .eq("estado", "cancelada");
      if (errorReversa) console.error("[cancelar-suscripcion] no se pudo revertir la fila", sub.id, errorReversa);
      return error("No pudimos hacerlo ahora. Probá de nuevo en un rato.", 502);
    }

    return Response.json({ ok: true, accesoHasta });
  }),
};
