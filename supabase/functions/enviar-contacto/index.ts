// Recibe el formulario de /contacto y lo guarda en `mensajes_contacto`, que la dueña lee en
// /admin/mensajes. Pública (`auth: "none"`): cualquiera puede escribir, con o sin cuenta.
//
// Todo se valida acá, nunca en la palabra del navegador:
// - Campos: largos, formato de email y asunto de una lista cerrada (los mismos `check` de la 0009).
// - Bots: el campo trampa `sitioWeb` llega vacío si es una persona. Si viene lleno, se responde 200 igual
//   (para no enseñarle al bot qué lo delató) y no se guarda nada.
// - Abuso: el límite (3 por IP por hora, IP de `cf-connecting-ip`; pasado el tope global de 60 por hora, se guarda marcado como
//   sospechoso) lo aplica un trigger de la 0009, en la misma transacción del insert. La IP se guarda
//   como hash con una sal propia (`CONTACTO_SAL_IP`): si falta, la función no guarda nada.
// No manda correos: no hay SMTP propio todavía, y así nada de lo que escribe la persona termina
// interpolado en una cabecera de correo.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

const SAL = Deno.env.get("CONTACTO_SAL_IP");
const ASUNTOS = ["consulta", "cuenta", "pagos", "datos", "otro"];
// Estricto a propósito (sin `%`): el email termina en un `mailto:` del panel y no puede colar nada más.
const EMAIL = /^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const error = (mensaje: string, status = 400) => Response.json({ ok: false, mensaje }, { status });
const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");

// La IP real la pone Cloudflare (delante de las Edge Functions) en `cf-connecting-ip`, y pisa cualquier
// valor que mande el cliente — verificado contra producción el 2026-09-30. `x-forwarded-for` NO sirve: su
// último valor es un proxy interno que cambia en cada pedido, y con él el límite nunca se alcanzaba.
function ipDe(req: Request): string {
  return req.headers.get("cf-connecting-ip")?.trim() || "desconocida";
}

async function hashDeIp(ip: string, sal: string): Promise<string> {
  const datos = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${sal}:${ip}`));
  return Array.from(new Uint8Array(datos)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default {
  fetch: withSupabase({ auth: "none" }, async (req, ctx) => {
    if (req.method !== "POST") return error("Método no permitido.", 405);
    if (!SAL) {
      console.error("[enviar-contacto] falta CONTACTO_SAL_IP");
      return error("No pudimos enviar tu mensaje. Probá de nuevo en un rato.", 500);
    }
    const cuerpo = await req.json().catch(() => null);
    if (texto(cuerpo?.sitioWeb)) return Response.json({ ok: true });

    const nombre = texto(cuerpo?.nombre);
    const email = texto(cuerpo?.email);
    const asunto = texto(cuerpo?.asunto);
    const mensaje = texto(cuerpo?.mensaje);
    if (nombre.length < 1 || nombre.length > 80) return error("Revisá tu nombre.");
    if (email.length > 254 || !EMAIL.test(email)) return error("Revisá tu email.");
    if (!ASUNTOS.includes(asunto)) return error("Elegí un asunto de la lista.");
    if (mensaje.length < 10 || mensaje.length > 2000) return error("El mensaje tiene que tener entre 10 y 2000 caracteres.");

    const ipHash = await hashDeIp(ipDe(req), SAL);
    const { error: errorInsert } = await ctx.supabaseAdmin.from("mensajes_contacto").insert({ nombre, email, asunto, mensaje, ip_hash: ipHash });
    if (errorInsert?.message?.includes("limite_por_ip")) {
      return error("Recibimos varios mensajes seguidos. Probá de nuevo en un rato.", 429);
    }
    if (errorInsert) {
      console.error("[enviar-contacto] insert", errorInsert);
      return error("No pudimos enviar tu mensaje. Probá de nuevo en un rato.", 500);
    }
    return Response.json({ ok: true });
  }),
};
