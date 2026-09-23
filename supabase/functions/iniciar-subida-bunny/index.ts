// Arranca la subida de un archivo (video o meditación) a Bunny Stream. No sube el archivo: crea el
// video en Bunny (server-side, con la API key) y devuelve una firma temporal para que el navegador
// suba directo a Bunny por TUS (protocolo reanudable) — así un archivo de hasta 2GB no pasa por acá,
// que tiene límites de tamaño y duración de pedido mucho más chicos que eso.
//
// La fila de `archivos_contenido` todavía NO se escribe acá: recién se escribe cuando se guarda la
// pieza de contenido entera (`guardar-archivo-bunny`), porque una pieza nueva todavía no tiene id en
// ese momento (se sube el archivo apenas se elige, no cuando se manda el formulario) — ver el
// comentario de esa función.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

const LIBRARY_ID = Deno.env.get("BUNNY_LIBRARY_ID");
const API_KEY = Deno.env.get("BUNNY_STREAM_API_KEY");

const error = (mensaje: string, status = 400) => Response.json({ ok: false, mensaje }, { status });
const LIMITE_MB: Record<"video" | "meditacion", number> = { video: 2048, meditacion: 500 };

// Un JWT de recuperación de contraseña no es una sesión plena (ver migración 0003): esta función usa
// `ctx.supabaseAdmin` (service_role), que no pasa por RLS ni por `sesion_de_recuperacion()`, así que
// hay que repetir el chequeo acá, a mano.
function esSesionDeRecuperacion(claims: Record<string, unknown>): boolean {
  const amr = claims?.amr;
  return Array.isArray(amr) && amr.some((e) => (e as { method?: string })?.method === "recovery");
}

// deno-lint-ignore no-explicit-any
async function esAdmin(supabaseAdmin: any, userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin.from("profiles").select("role").eq("id", userId).maybeSingle();
  return data?.role === "admin";
}

async function firmaTus(videoId: string, expira: number): Promise<string> {
  const mensaje = `${LIBRARY_ID}${API_KEY}${expira}${videoId}`;
  const datos = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(mensaje));
  return Array.from(new Uint8Array(datos)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (!LIBRARY_ID || !API_KEY) {
      console.error("[iniciar-subida-bunny] falta BUNNY_LIBRARY_ID o BUNNY_STREAM_API_KEY");
      return error("No pudimos iniciar la subida. Probá de nuevo en un rato.", 500);
    }
    if (esSesionDeRecuperacion(ctx.userClaims!)) return error("Iniciá sesión de nuevo para hacer esto.", 403);
    if (!(await esAdmin(ctx.supabaseAdmin, ctx.userClaims!.id as string))) return error("No tenés permiso para hacer esto.", 403);

    const cuerpo = await req.json().catch(() => null);
    const tipo = cuerpo?.tipo as "video" | "meditacion" | undefined;
    const nombre = typeof cuerpo?.nombre === "string" ? cuerpo.nombre.slice(0, 200) : "";
    const bytes = Number(cuerpo?.bytes);
    const tipoMime = typeof cuerpo?.tipoMime === "string" ? cuerpo.tipoMime : "";
    if (tipo !== "video" && tipo !== "meditacion") return error("Tipo de archivo inválido.");
    const clase = tipo === "video" ? "video/" : "audio/";
    if (!tipoMime.startsWith(clase)) return error(tipo === "video" ? "Elegí un archivo de video." : "Elegí un archivo de audio.");
    if (!Number.isFinite(bytes) || bytes <= 0) return error("Tamaño de archivo inválido.");
    if (bytes > LIMITE_MB[tipo] * 1024 * 1024) return error(`El archivo pesa más de ${LIMITE_MB[tipo]} MB.`);
    if (!nombre) return error("Falta el nombre del archivo.");

    const resp = await fetch(`https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", AccessKey: API_KEY },
      body: JSON.stringify({ title: nombre }),
    });
    if (!resp.ok) {
      console.error("[iniciar-subida-bunny] Bunny respondió", resp.status, await resp.text());
      return error("No pudimos iniciar la subida. Probá de nuevo en un rato.", 502);
    }
    const video = await resp.json();
    const videoId = video.guid as string;

    // Una hora: de sobra para subir hasta 2GB incluso en una conexión lenta, sin dejar la autorización
    // abierta indefinidamente (la misma idea de "vencimiento corto" que las URLs de reproducción,
    // adaptada a que acá el archivo puede tardar minutos en subir, no segundos en reproducirse).
    const expira = Math.floor(Date.now() / 1000) + 3600;
    const firma = await firmaTus(videoId, expira);

    return Response.json({ videoId, libraryId: LIBRARY_ID, authorizationSignature: firma, authorizationExpire: expira });
  }),
};
