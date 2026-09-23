// El webhook de Mercado Pago: valida la firma, es idempotente y nunca confía en lo que llega en el
// body — siempre vuelve a consultar la API por el estado real antes de escribir en `suscripciones`
// (Mercado Pago avisa que algo cambió; no dice qué es verdad).
//
// Orden: 1) validar x-signature (HMAC-SHA256, corta con 401 si no valida o si el secreto no está
// configurado, antes de tocar la base); 2) reservar el evento en `eventos_mp` — ESE insert es el
// candado de idempotencia, no un select previo (que no es atómico contra dos entregas simultáneas del
// mismo evento); si ya estaba reservado, responder 200 sin hacer nada más; 3) según el tipo, pedirle a
// la API el estado real y actualizar la fila; 4) si el paso 3 falla, liberar la reserva (si no, el
// reintento de Mercado Pago la encuentra "ya procesada" sin haberla procesado nunca) y responder
// distinto de 200 para que reintente.
//
// OJO con `subscription_authorized_payment`: la forma exacta de la respuesta de
// GET /authorized_payments/{id} no está confirmada contra un cobro de prueba real todavía (la
// documentación pública no la detalla del todo). Se loguea lo mínimo para poder revisarlo la primera
// vez que llegue un cobro rebotado de verdad, sin volcar el objeto completo (trae datos del pagador).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

const ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
const WEBHOOK_SECRET = Deno.env.get("MP_WEBHOOK_SECRET");

function parsearFirma(header: string | null): { ts: string | null; v1: string | null } {
  const partes: Record<string, string> = {};
  for (const par of (header ?? "").split(",")) {
    const [clave, valor] = par.split("=");
    if (clave && valor) partes[clave.trim()] = valor.trim();
  }
  return { ts: partes.ts ?? null, v1: partes.v1 ?? null };
}

// La plantilla exacta que pide Mercado Pago: un segmento por dato disponible, en este orden, cada uno
// con su `;` final; un dato ausente se OMITE entero (no se deja vacío).
//
// OJO: esta firma es la que define Mercado Pago, y no cubre `cuerpo.id` (la clave de idempotencia) ni
// `cuerpo.type` (qué endpoint se consulta después) — son campos del body que no forman parte del
// manifest. No es explotable sin conocer `MP_WEBHOOK_SECRET` (es una limitación del protocolo de MP,
// no del código), pero por eso los dos handlers vuelven a pedirle a la API el estado real en vez de
// confiar en nada del body.
function construirManifest(dataId: string | null, requestId: string | null, ts: string | null): string {
  let manifest = "";
  if (dataId) manifest += `id:${dataId.toLowerCase()};`;
  if (requestId) manifest += `request-id:${requestId};`;
  if (ts) manifest += `ts:${ts};`;
  return manifest;
}

async function hmacHex(secreto: string, mensaje: string): Promise<string> {
  const clave = await crypto.subtle.importKey("raw", new TextEncoder().encode(secreto), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const firma = await crypto.subtle.sign("HMAC", clave, new TextEncoder().encode(mensaje));
  return Array.from(new Uint8Array(firma)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Comparación en tiempo constante: nunca cortar apenas se encuentra la primera diferencia.
function iguales(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let distinto = 0;
  for (let i = 0; i < a.length; i++) distinto |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return distinto === 0;
}

// El `ts` de Mercado Pago viene en segundos; el umbral de 10^12 detecta solo si en algún momento
// pasa a milisegundos. Fuera de una ventana de 5 minutos, se rechaza: una firma capturada no sirve
// para reproducir el mismo pedido más tarde.
function firmaReciente(ts: string): boolean {
  const n = Number(ts);
  if (!Number.isFinite(n)) return false;
  const segundos = n > 1e12 ? n / 1000 : n;
  return Math.abs(Date.now() / 1000 - segundos) <= 300;
}

// null = no tocar el estado actual.
function estadoDesdePreapproval(status: string, estadoActual: string): string | null {
  switch (status) {
    case "pending":
      return "iniciada";
    case "authorized":
      return "activa";
    case "paused":
      // "paused" puede ser: 1) la pausó `cancelar-suscripcion` — esa fila ya está 'cancelada' acá,
      // no hay nada que actualizar; 2) Mercado Pago la pausó sola tras varios cobros fallidos, una
      // vencida real.
      return estadoActual === "cancelada" ? null : "vencida";
    case "cancelled":
      return "cancelada";
    default:
      return null;
  }
}

// Argentina no tiene horario de verano: UTC-3 todo el año, la misma zona que usa `tiene_acceso()` en
// la base (0002/0006/0007) para decidir hasta cuándo dura el acceso. Antes esto calculaba en UTC, que
// entre las 21:00 y las 00:00 ART ya es "mañana": la gracia de 3 días se volvía 4, y `reactivar-
// suscripcion` podía rechazar una reactivación en el último día válido cuando `tiene_acceso()` todavía
// decía que sí. Encontrado por la auditoría de verificación de la Tanda de Mercado Pago.
const fechaART = (offsetDias = 0) => new Date(Date.now() + offsetDias * 86_400_000 - 3 * 3_600_000).toISOString().slice(0, 10);
const hoyISO = () => fechaART(0);
const enDias = (dias: number) => fechaART(dias);

export default {
  // Público a propósito (nadie autenticado llama esto salvo Mercado Pago): la validación de la firma
  // es la única barrera, y el handler es enteramente responsable de aplicarla.
  fetch: withSupabase({ auth: "none" }, async (req, ctx) => {
    if (!ACCESS_TOKEN || !WEBHOOK_SECRET) {
      // Fallar cerrado. Sin el secreto, `hmacHex` firmaría con una clave vacía (`Deno.env.get` que no
      // encuentra la variable no tira, devuelve undefined, y de ahí sale un array vacío) y cualquiera
      // podría calcular una firma "válida" contra esa clave pública de hecho. Encontrado en la
      // auditoría de la Tanda de Mercado Pago.
      console.error("[webhook-mercado-pago] falta MP_ACCESS_TOKEN o MP_WEBHOOK_SECRET");
      return new Response("no configurado", { status: 500 });
    }

    const url = new URL(req.url);
    const cuerpo = await req.json().catch(() => null);
    const dataIdQuery = url.searchParams.get("data.id");
    const dataIdCuerpo = cuerpo?.data?.id != null ? String(cuerpo.data.id) : null;
    // Si vienen los dos, tienen que coincidir: el manifest solo puede firmar UN valor. Aceptar
    // cualquiera de los dos sin cruzarlos abriría la puerta a firmar un id y procesar otro.
    if (dataIdQuery && dataIdCuerpo && dataIdQuery !== dataIdCuerpo) {
      return new Response("data.id inconsistente", { status: 400 });
    }
    const dataId = dataIdQuery ?? dataIdCuerpo;

    const { ts, v1 } = parsearFirma(req.headers.get("x-signature"));
    const requestId = req.headers.get("x-request-id");
    if (!ts || !v1) return new Response("falta la firma", { status: 401 });
    if (!firmaReciente(ts)) return new Response("firma vencida", { status: 401 });

    const manifest = construirManifest(dataId, requestId, ts);
    const esperado = await hmacHex(WEBHOOK_SECRET, manifest);
    if (!iguales(esperado, v1)) return new Response("firma inválida", { status: 401 });

    const eventoId = String(cuerpo?.id ?? "");
    const tipo = String(cuerpo?.type ?? "");
    if (!eventoId) return new Response("sin id de evento", { status: 400 });

    // El insert ES el candado de idempotencia: si el evento ya estaba reservado, `ignoreDuplicates`
    // no inserta nada y acá no vuelve ninguna fila.
    const { data: reservado, error: errorReserva } = await ctx.supabaseAdmin
      .from("eventos_mp")
      .upsert({ id: eventoId, tipo }, { onConflict: "id", ignoreDuplicates: true })
      .select("id");
    if (errorReserva) {
      console.error("[webhook-mercado-pago] no se pudo reservar el evento", errorReserva);
      return new Response("error", { status: 500 });
    }
    if (!reservado?.length) return new Response("ya procesado", { status: 200 });

    try {
      if (tipo === "subscription_preapproval") {
        if (!dataId) console.error("[webhook-mercado-pago] subscription_preapproval sin data.id", eventoId);
        else await procesarPreapproval(ctx.supabaseAdmin, dataId);
      } else if (tipo === "subscription_authorized_payment") {
        if (!dataId) console.error("[webhook-mercado-pago] subscription_authorized_payment sin data.id", eventoId);
        else await procesarCobro(ctx.supabaseAdmin, dataId);
      } else {
        // Un tipo que deliberadamente no manejamos (Mercado Pago manda varios más): queda marcado
        // "procesado" a propósito, no hay nada que reintentar.
        console.info("[webhook-mercado-pago] tipo sin manejar, se ignora", tipo, dataId);
      }
    } catch (e) {
      // Se libera la reserva: si no, el reintento de MP la va a encontrar "ya procesada" sin haberse
      // procesado nunca. Repetirlo es seguro: los dos handlers vuelven a pedir el estado real.
      await ctx.supabaseAdmin.from("eventos_mp").delete().eq("id", eventoId);
      console.error("[webhook-mercado-pago] error procesando", tipo, dataId, e);
      return new Response("error procesando", { status: 500 });
    }

    return new Response("ok", { status: 200 });
  }),
};

// deno-lint-ignore no-explicit-any
async function procesarPreapproval(supabaseAdmin: any, preapprovalId: string) {
  const resp = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });
  if (!resp.ok) throw new Error(`GET /preapproval/${preapprovalId} → ${resp.status}: ${await resp.text()}`);
  const preapproval = await resp.json();

  const { data: fila } = await supabaseAdmin
    .from("suscripciones")
    .select("id, user_id, estado, proximo_cobro")
    .eq("preapproval_id", preapprovalId)
    .maybeSingle();
  if (!fila) {
    // Tirar el error (en vez de devolver en silencio) libera la reserva de arriba y hace que Mercado
    // Pago reintente en minutos: puede ser una carrera con `iniciar-suscripcion` (el insert todavía no
    // terminó cuando llegó este webhook), y para el reintento la fila ya va a existir. Si de verdad
    // nunca aparece, los reintentos de MP se agotan solos y queda en los logs de error, no perdido en
    // silencio. Encontrado por la auditoría de verificación de la Tanda de Mercado Pago.
    throw new Error(`preapproval sin fila en suscripciones: ${preapprovalId}`);
  }
  // Defensa de más: el preapproval tiene que corresponder a quien lo creó (external_reference se
  // manda así desde iniciar-suscripcion). Hoy no hay forma de que no coincida, pero es una línea
  // barata contra cualquier bug futuro que mezcle filas.
  if (preapproval.external_reference && preapproval.external_reference !== fila.user_id) {
    throw new Error(`external_reference no coincide con la fila: ${preapprovalId}`);
  }

  const nuevoEstado = estadoDesdePreapproval(preapproval.status, fila.estado);
  if (!nuevoEstado) return; // status desconocido, o "paused" que ya se sabía (ver estadoDesdePreapproval)

  // deno-lint-ignore no-explicit-any
  const datos: Record<string, any> = { estado: nuevoEstado, ultimo_evento: new Date().toISOString(), acceso_hasta: null };
  if (nuevoEstado === "activa") {
    datos.proximo_cobro = preapproval.next_payment_date ? String(preapproval.next_payment_date).slice(0, 10) : null;
    datos.medio_de_pago = "Mercado Pago"; // genérico: la API no devuelve los últimos 4 dígitos acá.
  }
  if (nuevoEstado === "cancelada") {
    datos.acceso_hasta = fila.proximo_cobro ?? hoyISO();
  }

  // Bloqueo optimista: si el estado de la fila cambió entre la lectura de arriba y este update (por
  // ejemplo, canceló mientras este webhook estaba en vuelo), no se pisa — gana el cambio más nuevo,
  // no el que tardó más en llegar.
  const { data: actualizada } = await supabaseAdmin
    .from("suscripciones")
    .update(datos)
    .eq("id", fila.id)
    .eq("estado", fila.estado)
    .select("id");
  if (!actualizada?.length) {
    console.warn("[webhook-mercado-pago] la fila cambió mientras se procesaba, se descarta este evento", preapprovalId);
  }
}

// deno-lint-ignore no-explicit-any
async function procesarCobro(supabaseAdmin: any, cobroId: string) {
  const resp = await fetch(`https://api.mercadopago.com/authorized_payments/${cobroId}`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });
  if (!resp.ok) throw new Error(`GET /authorized_payments/${cobroId} → ${resp.status}: ${await resp.text()}`);
  const cobro = await resp.json();
  const preapprovalId = cobro.preapproval_id as string | undefined;
  const estado = String(cobro.payment?.status ?? cobro.status ?? "").toLowerCase();
  console.info("[webhook-mercado-pago] authorized_payment", { preapprovalId, estado });
  if (!preapprovalId || !estado) {
    // Igual que arriba: tirar el error para que quede en los logs de fallo y Mercado Pago reintente,
    // en vez de perder en silencio un cobro que no pudimos interpretar.
    throw new Error(`authorized_payments sin preapproval_id o status reconocible: ${cobroId}`);
  }

  const { data: fila } = await supabaseAdmin.from("suscripciones").select("id, estado").eq("preapproval_id", preapprovalId).maybeSingle();
  if (!fila) throw new Error(`cobro sin fila en suscripciones: ${preapprovalId}`);

  if (["approved", "accredited"].includes(estado)) {
    // Todo cobro aprobado —la renovación mensual normal sobre 'activa', o el que recupera una
    // 'en_gracia'— tiene que refrescar `proximo_cobro`: antes esto solo pasaba al entrar A 'activa'
    // por primera vez (en `procesarPreapproval`), así que cualquier suscripción con más de un cobro
    // quedaba con la fecha vieja. Con el tope que le puso la migración 0007 a `proximo_cobro is null`,
    // eso terminaba cortando el acceso de alguien que sí estaba pagando. Encontrado por la auditoría
    // de verificación de la Tanda de Mercado Pago.
    const preResp = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });
    if (!preResp.ok) throw new Error(`GET /preapproval/${preapprovalId} → ${preResp.status}: ${await preResp.text()}`);
    const preapproval = await preResp.json();
    const proximoCobro = preapproval.next_payment_date ? String(preapproval.next_payment_date).slice(0, 10) : null;

    // deno-lint-ignore no-explicit-any
    const datos: Record<string, any> = { proximo_cobro: proximoCobro, ultimo_evento: new Date().toISOString() };
    if (fila.estado === "en_gracia") {
      datos.estado = "activa";
      datos.acceso_hasta = null;
    }
    await supabaseAdmin.from("suscripciones").update(datos).eq("id", fila.id).eq("estado", fila.estado).select("id");
  } else if (["rejected", "cancelled"].includes(estado) && fila.estado === "activa") {
    await supabaseAdmin
      .from("suscripciones")
      .update({ estado: "en_gracia", acceso_hasta: enDias(3), ultimo_evento: new Date().toISOString() })
      .eq("id", fila.id)
      .eq("estado", "activa");
  }
}
