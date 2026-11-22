// Crea la suscripción (preapproval) en Mercado Pago y devuelve la URL del checkout alojado por MP.
// No manda card_token_id: así MP arma un `init_point` en vez de cobrar directo, y quien se suscribe
// termina de autorizar del lado de MP. El estado real después lo escribe el webhook, nunca esta
// función a mano: acá solo se guarda 'iniciada' para tener la fila desde el principio.
//
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@1.9.0";

const ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
// La misma sal que usa `enviar-contacto` para la IP: acá firma la huella del email (descuento del primer mes).
const SAL = Deno.env.get("CONTACTO_SAL_IP");

// Huella del email para reconocer a quien ya se suscribió alguna vez, aunque haya borrado la cuenta (0022).
// Normaliza: minúsculas y, en Gmail, sin puntos ni «+algo» (son la misma casilla).
async function huellaDeEmail(email: string): Promise<string | null> {
  if (!SAL || !email) return null;
  let [usuario, dominio] = email.trim().toLowerCase().split("@");
  if (!dominio) return null;
  if (dominio === "gmail.com" || dominio === "googlemail.com") {
    usuario = usuario.split("+")[0].replaceAll(".", "");
    dominio = "gmail.com";
  }
  const clave = await crypto.subtle.importKey("raw", new TextEncoder().encode(SAL), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const firma = await crypto.subtle.sign("HMAC", clave, new TextEncoder().encode(`${usuario}@${dominio}`));
  return Array.from(new Uint8Array(firma)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://mareainterior.vercel.app";

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
    if (!ACCESS_TOKEN) {
      console.error("[iniciar-suscripcion] falta MP_ACCESS_TOKEN");
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

    // El precio sale de la tabla `plan` (0021, lo edita la dueña). Sin fallback a propósito (auditoría de la
    // Tanda de Mercado Pago): si no se puede leer, mejor que falle claro a que cobre un número inventado.
    const { data: plan, error: errorPlan } = await ctx.supabaseAdmin.from("plan").select("precio_ars, descuento_pct").maybeSingle();
    if (errorPlan || !plan) {
      console.error("[iniciar-suscripcion] lectura de plan", errorPlan);
      return error("No pudimos iniciar la suscripción. Probá de nuevo en un rato.");
    }

    // Descuento del primer mes (0022): solo para quien se suscribe por primera vez, es decir, quien nunca tuvo
    // una fila más allá de un checkout abandonado ('iniciada'), ni con esta cuenta ni con el mismo email en una
    // cuenta borrada (`email_huella`). El primer cobro sale rebajado; el webhook pasa la preapproval al precio
    // normal apenas llega ese primer cobro aprobado (`descuento_pendiente`). Sin sal no se puede reconocer el
    // email: por las dudas, sin descuento.
    const huella = await huellaDeEmail(email);
    let conDescuento = false;
    if (plan.descuento_pct && huella) {
      const { count, error: errorHistoria } = await ctx.supabaseAdmin
        .from("suscripciones")
        .select("id", { count: "exact", head: true })
        .or(`user_id.eq.${userId},email_huella.eq.${huella}`)
        .neq("estado", "iniciada");
      if (errorHistoria) return error("No pudimos hacerlo ahora. Probá de nuevo en un rato.");
      conDescuento = count === 0;
    }
    const monto = conDescuento ? Math.round((plan.precio_ars * (100 - plan.descuento_pct!)) / 100) : plan.precio_ars;

    const resp = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ACCESS_TOKEN}` },
      body: JSON.stringify({
        reason: "Marea Interior — suscripción mensual",
        external_reference: userId,
        payer_email: email,
        back_url: `${SITE_URL}/suscripcion/resultado`,
        auto_recurring: { frequency: 1, frequency_type: "months", transaction_amount: monto, currency_id: "ARS" },
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
      descuento_pendiente: conDescuento,
      email_huella: huella,
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
