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
import { withSupabase } from "jsr:@supabase/server@1.9.0";

const LIBRARY_ID = Deno.env.get("BUNNY_LIBRARY_ID");
const API_KEY = Deno.env.get("BUNNY_STREAM_API_KEY");

// Enum `VideoModelStatus` de la API de Bunny Stream (confirmado contra la documentación oficial):
// 0 Created, 1 Uploaded, 2 Processing, 3 Transcoding, 4 Finished, 5 Error, 6 UploadFailed. Solo 4
// significa "listo para reproducirse de verdad".
const ESTADO_TERMINADO = 4;

const error = (mensaje: string, status = 400) => Response.json({ ok: false, mensaje }, { status });

// `availableResolutions` de Bunny es un string tipo "360p,720p,1080p": las resoluciones que YA
// terminó de codificar (nunca asume una fija). Bunny no genera nada más grande que el original, así
// que un video de bajo lado puede no tener 720p — se usa la más alta que sí exista de verdad, con un
// techo en 720p (servir 1080p/4K sin necesidad, en un sitio mobile-first sin bitrate adaptativo, sale
// caro en ancho de banda para quien mira desde el celular con datos). Encontrado en la auditoría de
// seguridad del fix de resolución.
const TECHO_ALTURA = 720;
function mejorResolucion(disponibles: unknown): string | null {
  if (typeof disponibles !== "string" || !disponibles) return null;
  const alturas = disponibles
    .split(",")
    .map((r) => parseInt(r, 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!alturas.length) return null;
  const hastaElTecho = alturas.filter((n) => n <= TECHO_ALTURA);
  return `${hastaElTecho.length ? Math.max(...hastaElTecho) : Math.min(...alturas)}p`;
}

function esSesionDeRecuperacion(claims: Record<string, unknown>): boolean {
  const amr = claims?.amr;
  return Array.isArray(amr) && amr.some((e) => (e as { method?: string })?.method === "recovery");
}

// Una sola definición de admin para todo el proyecto: la función `es_admin()` de la base, llamada con
// el JWT de quien pide (igual que `firmar-video-bunny`). Si algún día exige más (por ejemplo, un
// segundo factor), estas funciones lo heredan solas en vez de leer `profiles.role` por su cuenta.
// deno-lint-ignore no-explicit-any
async function esAdmin(supabase: any): Promise<boolean> {
  const { data, error } = await supabase.rpc("es_admin");
  return !error && data === true;
}

// Los ids de Bunny son GUID: cualquier otra cosa se rechaza antes de armar una URL de su API con ella
// (un `../` cambiaría la ruta del pedido).
const ID_VALIDO = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    if (!(await esAdmin(ctx.supabase))) return error("No tenés permiso para hacer esto.", 403);

    const cuerpo = await req.json().catch(() => null);

    if (cuerpo?.accion === "descartar") {
      const videoId = typeof cuerpo?.videoId === "string" ? cuerpo.videoId : "";
      if (!ID_VALIDO.test(videoId)) return error("Falta el archivo a descartar.");
      // Solo se descarta lo que nunca se asoció a una pieza: un video en uso no se borra por esta vía
      // (ni por un error de la limpieza del formulario ni con una sesión de admin robada). Borrar una
      // pieza o un tema lo libera primero (la fila se va en cascada) y recién después lo descarta.
      const { data: enUso } = await ctx.supabaseAdmin.from("archivos_contenido").select("contenido_id").eq("bunny_video_id", videoId).maybeSingle();
      if (enUso) return error("Ese archivo está en uso en una pieza: no se descarta.", 409);
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
    if (!ID_VALIDO.test(videoId)) return error("Falta el archivo subido.");
    // Un mismo video no puede quedar en dos piezas: al quitarlo de una se borraría de la otra.
    const { data: deOtra } = await ctx.supabaseAdmin.from("archivos_contenido").select("contenido_id").eq("bunny_video_id", videoId).neq("contenido_id", contenidoId).maybeSingle();
    if (deOtra) return error("Ese archivo ya está en otra pieza. Subilo de nuevo.", 409);

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
    const resolucion = mejorResolucion(video.availableResolutions);
    if (!resolucion) {
      // No debería pasar con status === 4 (ver arriba), pero si Bunny no confirma ninguna resolución
      // no hay ningún play_*.mp4 real que firmar después: mejor avisar ahora que dejar una pieza
      // "guardada" que ninguna suscriptora puede reproducir.
      console.error("[guardar-archivo-bunny] sin availableResolutions", videoId, video.availableResolutions);
      // Una meditación es audio puro: la API de Bunny nunca confirmó si genera `availableResolutions`
      // para un archivo sin pista de video (no probado todavía contra un audio real — ver CLAUDE.md).
      // Si no las genera, este caso no es transitorio y "probá de nuevo" es un mensaje engañoso: mejor
      // decirlo distinto para no hacer perder el tiempo reintentando algo que nunca va a cambiar.
      const { data: contenido } = await ctx.supabaseAdmin.from("contenidos").select("tipo").eq("id", contenidoId).maybeSingle();
      if (contenido?.tipo === "meditacion") {
        return error("Bunny no generó ninguna versión reproducible de este audio. Puede ser un problema de fondo con archivos de solo audio, no algo que se resuelva reintentando — avisale a Joaquín antes de seguir insistiendo.", 409);
      }
      return error("Bunny no terminó de generar ninguna calidad reproducible para este archivo. Probá de nuevo en un rato.", 409);
    }

    const { error: errorGuardar } = await ctx.supabaseAdmin
      .from("archivos_contenido")
      .upsert({ contenido_id: contenidoId, bunny_video_id: videoId, nombre: nombreCliente, bytes, resolucion }, { onConflict: "contenido_id" });
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
