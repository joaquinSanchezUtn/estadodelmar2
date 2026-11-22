// Cambia el precio del plan mensual (tabla `plan`, migración 0021) y lo aplica a las suscripciones que ya
// existen en Mercado Pago, desde su próximo cobro (decisión de Joaquin, 2026-11-22: «todas, también las
// actuales»). Solo la admin.
//
//   { accion: "consultar" }                      → { ok, precioArs, descuentoPct, suscriptas }
//   { accion: "cambiar", precioArs: 12000 }      → { ok, precioArs, actualizadas, fallidas }
//   { accion: "reaplicar" }                      → lo mismo, con el precio que ya está en la tabla
//   { accion: "descuento", descuentoPct: 20 }    → prende o cambia el descuento del primer mes (null lo apaga)
//
// El orden importa: primero la base (así toda suscripción NUEVA ya sale con el precio nuevo, aunque Mercado
// Pago falle a mitad de camino), después cada preapproval. Si alguna falla, se informa cuántas, y «reaplicar»
// reintenta todas (es idempotente: a la que ya tenía ese monto no le cambia nada).
// Las que Mercado Pago ya dio por terminadas (`cancelled`) se saltean: no se pueden editar ni van a cobrar.
//
// SIN PROBAR contra una suscripción real (al 2026-11-22 no hay ninguna activa): la forma del PUT
// (`auto_recurring.transaction_amount`) es la de la documentación de `PUT /preapproval/{id}`.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@1.9.0";

const ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
const error = (mensaje: string, status = 400) => Response.json({ ok: false, mensaje }, { status });
// Las que pueden volver a cobrar algún día. `vencida` también: puede estar pausada con reintentos.
const CON_COBRO_POSIBLE = ["iniciada", "pendiente", "activa", "en_gracia", "cancelada", "vencida"];
// Las que se le cuentan a la dueña como «personas suscriptas» (un checkout abandonado o una vencida no lo son,
// aunque igual se les actualiza el monto por si vuelven a cobrar).
const SUSCRIPTAS = ["pendiente", "activa", "en_gracia", "cancelada"];
const MINIMO = 100;
const MAXIMO = 10_000_000;

function esSesionDeRecuperacion(claims: Record<string, unknown>): boolean {
  const amr = claims?.amr;
  return Array.isArray(amr) && amr.some((e) => (e as { method?: string })?.method === "recovery");
}

// La misma definición de admin que el resto del proyecto: `es_admin()` de la base, con el JWT de quien pide.
// deno-lint-ignore no-explicit-any
async function esAdmin(supabase: any): Promise<boolean> {
  const { data, error } = await supabase.rpc("es_admin");
  return !error && data === true;
}

const mp = (ruta: string, init?: RequestInit) =>
  fetch(`https://api.mercadopago.com${ruta}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${ACCESS_TOKEN}` } });

// Le pone el precio nuevo a una preapproval. true si quedó (o si ya no hace falta: terminada en MP).
async function actualizar(preapprovalId: string, precio: number): Promise<boolean> {
  try {
    const actual = await mp(`/preapproval/${encodeURIComponent(preapprovalId)}`);
    if (!actual.ok) return false;
    const datos = await actual.json();
    if (datos.status === "cancelled") return true;
    if (datos.auto_recurring?.transaction_amount === precio) return true;
    const resp = await mp(`/preapproval/${encodeURIComponent(preapprovalId)}`, {
      method: "PUT",
      body: JSON.stringify({ auto_recurring: { transaction_amount: precio, currency_id: "ARS" } }),
    });
    if (!resp.ok) console.error("[cambiar-precio] MP respondió", resp.status, preapprovalId, await resp.text());
    return resp.ok;
  } catch (e) {
    console.error("[cambiar-precio] sin respuesta de MP", preapprovalId, e);
    return false;
  }
}

// Lo que se lee de la base en cada pasada: el precio vigente y las suscripciones que pueden volver a cobrar.
// deno-lint-ignore no-explicit-any
async function leer(admin: any): Promise<{ precio: number; descuentoPct: number | null; subs: { preapproval_id: string; estado: string; descuento_pendiente: boolean }[] } | null> {
  const [{ data: plan, error: e1 }, { data: subs, error: e2 }] = await Promise.all([
    admin.from("plan").select("precio_ars, descuento_pct").maybeSingle(),
    admin.from("suscripciones").select("preapproval_id, estado, descuento_pendiente").in("estado", CON_COBRO_POSIBLE).not("user_id", "is", null).not("preapproval_id", "is", null),
  ]);
  if (e1 || e2 || !plan) return null;
  return { precio: plan.precio_ars, descuentoPct: plan.descuento_pct, subs };
}

// Lleva todas las suscripciones al precio de la tabla. Vuelve a leer al terminar cada pasada, porque mientras
// tanto pudo haberse creado una suscripción con el precio viejo (`iniciar-suscripcion` lee el precio antes de
// guardar su fila) o pudo haber otro cambio de precio: si apareció algo nuevo, otra pasada (hasta tres). Las que
// ya están bien no se tocan (`actualizar` lo mira antes), así que repetir es barato.
// deno-lint-ignore no-explicit-any
async function aplicar(admin: any): Promise<{ precio: number; actualizadas: number; fallidas: number } | null> {
  const hechas = new Map<string, number>();
  let fallidas = new Set<string>();
  let precio = 0;
  for (let pasada = 0; pasada < 3; pasada++) {
    const datos = await leer(admin);
    if (!datos) return null;
    precio = datos.precio;
    // Las que todavía esperan su primer cobro con descuento (0022) no se tocan: el webhook las pasa al precio
    // normal que haya cuando llegue ese cobro.
    const faltan = datos.subs.filter((s) => !s.descuento_pendiente).map((s) => s.preapproval_id).filter((id) => hechas.get(id) !== precio);
    if (faltan.length === 0) break;
    fallidas = new Set([...fallidas].filter((id) => !faltan.includes(id)));
    // De a cinco por vez: rápido sin pisarle el límite de pedidos a Mercado Pago.
    for (let i = 0; i < faltan.length; i += 5) {
      const lote = faltan.slice(i, i + 5);
      const resultados = await Promise.all(lote.map((id) => actualizar(id, precio)));
      lote.forEach((id, k) => (resultados[k] ? hechas.set(id, precio) : fallidas.add(id)));
    }
    // Las que fallaron no cuentan como «algo nuevo»: se reintentan con «Reintentar», no en un bucle acá.
    fallidas.forEach((id) => hechas.set(id, precio));
  }
  return { precio, actualizadas: [...hechas.keys()].length - fallidas.size, fallidas: fallidas.size };
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (!ACCESS_TOKEN) {
      console.error("[cambiar-precio] falta MP_ACCESS_TOKEN");
      return error("No pudimos hacerlo ahora. Probá de nuevo en un rato.", 500);
    }
    if (esSesionDeRecuperacion(ctx.userClaims!)) return error("Iniciá sesión de nuevo para hacer esto.", 403);
    if (!(await esAdmin(ctx.supabase))) return error("No tenés permiso para hacer esto.", 403);

    const cuerpo = await req.json().catch(() => null);
    const accion = cuerpo?.accion;

    if (accion === "consultar") {
      const datos = await leer(ctx.supabaseAdmin);
      if (!datos) return error("No pudimos leer el precio. Probá de nuevo en un rato.", 500);
      return Response.json({ ok: true, precioArs: datos.precio, descuentoPct: datos.descuentoPct, suscriptas: datos.subs.filter((s) => SUSCRIPTAS.includes(s.estado)).length });
    }

    if (accion === "cambiar") {
      const precio = Number(cuerpo?.precioArs);
      if (!Number.isInteger(precio) || precio < MINIMO || precio > MAXIMO) {
        return error(`El precio tiene que ser un número entero de pesos, entre ${MINIMO} y ${MAXIMO.toLocaleString("es-AR")}.`);
      }
      const { data: guardado, error: errorUpdate } = await ctx.supabaseAdmin
        .from("plan")
        .update({ precio_ars: precio, actualizado_en: new Date().toISOString() })
        .not("id", "is", null)
        .select("precio_ars");
      if (errorUpdate || !guardado?.length) {
        console.error("[cambiar-precio] update plan", errorUpdate);
        return error("No pudimos guardar el precio. Probá de nuevo en un rato.", 500);
      }
    } else if (accion === "descuento") {
      // Prender, cambiar o apagar el descuento del primer mes (0022). Solo afecta a quien se suscriba de acá en
      // adelante: no hay nada que aplicar en Mercado Pago.
      const pct = cuerpo?.descuentoPct === null ? null : Number(cuerpo?.descuentoPct);
      if (pct !== null && (!Number.isInteger(pct) || pct < 1 || pct > 90)) return error("El descuento va de 1 % a 90 %.");
      const { data: guardado, error: errorDescuento } = await ctx.supabaseAdmin.from("plan").update({ descuento_pct: pct, actualizado_en: new Date().toISOString() }).not("id", "is", null).select("precio_ars, descuento_pct");
      if (errorDescuento || !guardado?.length) {
        console.error("[cambiar-precio] update descuento", errorDescuento);
        return error("No pudimos guardar el descuento. Probá de nuevo en un rato.", 500);
      }
      return Response.json({ ok: true, precioArs: guardado[0].precio_ars, descuentoPct: guardado[0].descuento_pct, actualizadas: 0, fallidas: 0 });
    } else if (accion !== "reaplicar") {
      // «reaplicar» (el botón «Reintentar») no manda ningún número: usa el que esté en la tabla, así un reintento
      // viejo nunca pisa un cambio de precio posterior.
      return error("Pedido inválido.");
    }

    const r = await aplicar(ctx.supabaseAdmin);
    if (!r) return error("El precio quedó guardado, pero no pudimos leer las suscripciones. Tocá «Reintentar» en un rato.", 500);
    return Response.json({ ok: true, precioArs: r.precio, actualizadas: r.actualizadas, fallidas: r.fallidas });
  }),
};
