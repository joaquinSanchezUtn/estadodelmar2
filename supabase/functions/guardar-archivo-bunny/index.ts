// Confirma o quita el archivo de Bunny asociado a una pieza de contenido. Es la única función que
// escribe `archivos_contenido` (la RLS de esa tabla no da ningún grant de escritura al cliente): se
// llama recién cuando la pieza ya tiene un id real, porque `iniciar-subida-bunny` sube el archivo a
// Bunny ANTES de que exista la fila en `contenidos` (se sube apenas se elige el archivo en el
// formulario, no cuando se lo manda) — así que esta es la que de verdad asocia uno con el otro, desde
// `guardarContenidoAdmin` (al guardar) o `eliminarContenidoAdmin` (al borrar la pieza entera).
//
// Tres acciones: `guardar` (asocia un video ya subido a una pieza), `quitar` (desasocia y borra el de
// una pieza existente) y `descartar` (borra un video de Bunny que nunca llegó a asociarse — se
// canceló la subida, se sacó el archivo antes de guardar el formulario, o se abandonó sin guardar; no
// toca la base, porque no hay ninguna fila que tocar).
//
// Nunca confía en lo que dice el cliente sobre el archivo: en `guardar`, vuelve a preguntarle a Bunny
// que el video exista Y haya terminado de procesar (`status`), y usa su tamaño real (`storageSize`) —
// nunca el que mandó el navegador. Un video que Bunny todavía no terminó de procesar (o que falló)
// nunca se asocia a una pieza: si se guardara igual, la pieza quedaría publicada con un archivo que
// nunca va a reproducirse.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

const LIBRARY_ID = Deno.env.get("BUNNY_LIBRARY_ID");
const API_KEY = Deno.env.get("BUNNY_STREAM_API_KEY");

// Enum `VideoModelStatus` de la API de Bunny Stream (confirmado contra la documentación oficial):
// 0 Created, 1 Uploaded, 2 Processing, 3 Transcoding, 4 Finished, 5 Error, 6 UploadFailed. Solo 4
// significa "listo para reproducirse de verdad".
const ESTADO_TERMINADO = 4;

const error = (mensaje: string, status = 400) => Response.json({ ok: false, mensaje }, { status });

function esSesionDeRecuperacion(claims: Record<string, unknown>): boolean {
  const amr = claims?.amr;
  return Array.isArray(amr) && amr.some((e) => (e as { method?: string })?.method === "recovery");
}

// deno-lint-ignore no-explicit-any
async function esAdmin(supabaseAdmin: any, userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin.from("profiles").select("role").eq("id", userId).maybeSingle();
  return data?.role === "admin";
}

async function borrarEnBunny(videoId: string) {
  const resp = await fetch(`https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoId}`, {
    method: "DELETE",
    headers: { AccessKey: API_KEY! },
  });
  // 404 = ya no está en Bunny (o nunca terminó de subirse): no es un error, el resultado que se
  // quería ya es cierto.
  if (!resp.ok && resp.status !== 404) console.error("[guardar-archivo-bunny] no se pudo borrar en Bunny", videoId, resp.status, await resp.text());
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (!LIBRARY_ID || !API_KEY) {
      console.error("[guardar-archivo-bunny] falta BUNNY_LIBRARY_ID o BUNNY_STREAM_API_KEY");
      return error("No pudimos guardar el archivo. Probá de nuevo en un rato.", 500);
    }
    if (esSesionDeRecuperacion(ctx.userClaims!)) return error("Iniciá sesión de nuevo para hacer esto.", 403);
    if (!(await esAdmin(ctx.supabaseAdmin, ctx.userClaims!.id as string))) return error("No tenés permiso para hacer esto.", 403);

    const cuerpo = await req.json().catch(() => null);

    if (cuerpo?.accion === "descartar") {
      const videoId = typeof cuerpo?.videoId === "string" ? cuerpo.videoId : "";
      if (!videoId) return error("Falta el archivo a descartar.");
      await borrarEnBunny(videoId);
      return Response.json({ ok: true });
    }

    const contenidoId = typeof cuerpo?.contenidoId === "string" ? cuerpo.contenidoId : "";
    if (!contenidoId) return error("Falta la pieza de contenido.");

    const { data: anterior } = await ctx.supabaseAdmin.from("archivos_contenido").select("bunny_video_id").eq("contenido_id", contenidoId).maybeSingle();

    if (cuerpo?.accion === "quitar") {
      await ctx.supabaseAdmin.from("archivos_contenido").delete().eq("contenido_id", contenidoId);
      if (anterior) await borrarEnBunny(anterior.bunny_video_id);
      return Response.json({ ok: true });
    }

    const videoId = typeof cuerpo?.videoId === "string" ? cuerpo.videoId : "";
    const nombreCliente = typeof cuerpo?.nombre === "string" ? cuerpo.nombre.slice(0, 200) : "archivo";
    if (!videoId) return error("Falta el archivo subido.");

    const resp = await fetch(`https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoId}`, {
      headers: { Accept: "application/json", AccessKey: API_KEY },
    });
    if (!resp.ok) {
      console.error("[guardar-archivo-bunny] Bunny respondió", resp.status, await resp.text());
      return error("No encontramos ese archivo en Bunny. Volvé a subirlo.", 502);
    }
    const video = await resp.json();
    if (video.status !== ESTADO_TERMINADO) {
      console.error("[guardar-archivo-bunny] video sin terminar de procesar", videoId, video.status);
      return error("Bunny todavía no terminó de procesar el archivo. Esperá un momento y volvé a guardar.", 409);
    }
    const bytes = Number(video.storageSize) || 0;

    const { error: errorGuardar } = await ctx.supabaseAdmin
      .from("archivos_contenido")
      .upsert({ contenido_id: contenidoId, bunny_video_id: videoId, nombre: nombreCliente, bytes }, { onConflict: "contenido_id" });
    if (errorGuardar) {
      console.error("[guardar-archivo-bunny] upsert archivos_contenido", errorGuardar);
      return error("No pudimos guardar el archivo. Probá de nuevo en un rato.", 500);
    }

    // Si estaba reemplazando un archivo anterior por uno distinto, el video viejo queda huérfano en
    // Bunny (sigue cobrando almacenamiento) si no se borra acá.
    if (anterior && anterior.bunny_video_id !== videoId) await borrarEnBunny(anterior.bunny_video_id);

    return Response.json({ ok: true, archivo: { nombre: nombreCliente, bytes } });
  }),
};
