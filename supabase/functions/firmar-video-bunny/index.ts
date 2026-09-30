// Firma la URL de reproducción de un video o audio de Bunny Stream. Repite las condiciones antes de
// firmar en vez de confiar en la RLS de `contenidos`: el id de Bunny vive aparte, en
// `archivos_contenido`, que su propia RLS ya protege (solo lo lee la dueña), así que acá hay que volver
// a decidir todo desde cero con `service_role`.
//
// La condición exacta es la misma que ya usan `contenidos_con_acceso`/`contenidos_admin` juntas: una
// admin puede firmar cualquier pieza (para previsualizar un borrador en `/admin/.../contenidos/:id`,
// donde este mismo Reproductor se reusa como "Así la ven las suscriptoras"); cualquier otra sesión
// necesita la pieza publicada, la ventana publicada, y `tiene_acceso()`.
//
// `tiene_acceso()`/`es_admin()` se llaman con `ctx.supabase` (el cliente con el JWT de quien pide, no
// `ctx.supabaseAdmin`): son las mismas funciones ya auditadas que usa el resto del sitio, y así el
// `auth.uid()` que leen adentro es el correcto. Como esas funciones ya excluyen una sesión de
// recuperación (`sesion_de_recuperacion()`), acá no hace falta repetir ese chequeo a mano.
//
// ⚠️ REQUISITO EN BUNNY, NO EN CÓDIGO — sin esto, todo lo de arriba es cosmético: el token que
// arma esta función no protege nada si la Library no lo exige. Antes de dar por cerrada esta tanda,
// en el panel de bunny.net, para la Library de este proyecto:
//   1. Security → Token Authentication: ACTIVADO, con la misma clave que `BUNNY_TOKEN_KEY`.
//   2. Security → Embed View Token Authentication: ACTIVADO (o, más simple: desactivar el reproductor
//      embebido de Bunny — `iframe.mediadelivery.net/embed|play/...` — directamente, porque este sitio
//      tiene reproductor propio y nunca lo usa). Sin esto, alguien con el `bunny_video_id` igual arma
//      un enlace público que no vence nunca a través de ese reproductor alojado por Bunny.
//   3. Allowed domains: el dominio de producción. Bunny compara el Referer CON el puerto: `localhost`
//      no deja pasar `localhost:5173`; para probar en desarrollo hay que agregar `localhost:<puerto>`.
// Verificación de una línea antes de cerrar: pedir `https://{PULL_ZONE_HOST}/{guid}/play_{resolucion}.mp4`
// (la resolución real de un video ya guardado, columna `archivos_contenido.resolucion`) SIN token
// — tiene que devolver 403. Si devuelve 200, el gate premium de video está abierto.
// Encontrado por la auditoría de la Tanda de los videos.
//
// OJO con probar a mano pidiendo `play_720p.mp4` sin más: Bunny nunca genera un rendition MÁS GRANDE
// que la resolución original del video subido, así que un video de bajo lado (algo grabado en menos
// de 720p) no tiene ese archivo — un 403 ahí no prueba nada sobre el token, prueba que el archivo no
// existe. Por eso `resolucion` se guarda por video (migración 0008) en vez de asumirse fija: se
// encontró probando una subida real de punta a punta con un video de prueba en baja resolución.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

const PULL_ZONE_HOST = Deno.env.get("BUNNY_PULL_ZONE_HOST");
const TOKEN_KEY = Deno.env.get("BUNNY_TOKEN_KEY");
const VIGENCIA_SEG = 15 * 60;

const error = (mensaje: string, status = 400) => Response.json({ ok: false, mensaje }, { status });

function base64UrlDeBytes(bytes: Uint8Array): string {
  let binario = "";
  for (const b of bytes) binario += String.fromCharCode(b);
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Token Authentication de Bunny, con la misma forma que usa su propio panel (verificada contra una URL
// que él firmó y dio 200): Base64URL(SHA256(clave + token_path + expires + "token_path=" + token_path)),
// con el token en el path (`/bcdn_token=...&expires=...&token_path=.../{guid}/archivo`). `token_path` es la
// carpeta del video: el token vale 15 minutos para todo lo de esa carpeta (todas sus calidades, la
// miniatura, el HLS y, con "Keep original files" activado, posiblemente el original). Solo de ESA pieza.
// Reemplaza a la variante MD5 ("Basic"), que Bunny marca como deprecada.
async function firmar(tokenPath: string, expira: number): Promise<string> {
  const datos = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${TOKEN_KEY}${tokenPath}${expira}token_path=${tokenPath}`));
  return base64UrlDeBytes(new Uint8Array(datos));
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (!PULL_ZONE_HOST || !TOKEN_KEY) {
      console.error("[firmar-video-bunny] falta BUNNY_PULL_ZONE_HOST o BUNNY_TOKEN_KEY");
      return error("No pudimos preparar la reproducción. Probá de nuevo en un rato.", 500);
    }

    const cuerpo = await req.json().catch(() => null);
    const contenidoId = typeof cuerpo?.contenidoId === "string" ? cuerpo.contenidoId : "";
    if (!contenidoId) return error("Falta la pieza de contenido.");

    const { data: contenido } = await ctx.supabaseAdmin.from("contenidos").select("id, publicado, tema_id").eq("id", contenidoId).maybeSingle();
    if (!contenido) return Response.json(null);

    const { data: esAdminSesion } = await ctx.supabase.rpc("es_admin");
    let permitido = !!esAdminSesion;
    if (!permitido) {
      const { data: tema } = await ctx.supabaseAdmin.from("temas").select("publicado").eq("id", contenido.tema_id).maybeSingle();
      if (contenido.publicado && tema?.publicado) {
        const { data: tieneAcceso } = await ctx.supabase.rpc("tiene_acceso");
        permitido = !!tieneAcceso;
      }
    }
    if (!permitido) return Response.json(null);

    const { data: archivo } = await ctx.supabaseAdmin.from("archivos_contenido").select("bunny_video_id, resolucion").eq("contenido_id", contenidoId).maybeSingle();
    if (!archivo) return Response.json(null); // todavía no se subió el archivo

    const expira = Math.floor(Date.now() / 1000) + VIGENCIA_SEG;
    // `resolucion` es la que `guardar-archivo-bunny` confirmó que Bunny terminó de generar para ESTE
    // video (nunca una fija: Bunny no genera nada más grande que la resolución original subida).
    const carpeta = `/${archivo.bunny_video_id}/`;
    const token = await firmar(carpeta, expira);
    const firma = `bcdn_token=${token}&expires=${expira}&token_path=${encodeURIComponent(carpeta)}`;

    return Response.json({ url: `https://${PULL_ZONE_HOST}/${firma}${carpeta}play_${archivo.resolucion}.mp4`, venceEn: expira * 1000 });
  }),
};
