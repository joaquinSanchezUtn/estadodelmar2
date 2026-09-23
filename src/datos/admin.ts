// Panel de administración: crear, editar, ordenar, publicar y borrar ventanas y sus piezas, y subir
// archivos. Ventanas, piezas y archivos ya son consultas reales a Supabase / Bunny Stream.
//
// OJO: `esAdmin()` acá es la barrera real solo para lo que ESCRIBE (insert/update/delete): ahí sí,
// si la sesión no es admin, las policies `temas_admin`/`contenidos_admin` (es_admin()) rechazan la
// escritura pase lo que pase acá, y el chequeo de este archivo es nada más un mensaje temprano y
// claro en vez de un error genérico de Postgres. Para lo que LEE (`listarTemasAdmin` y las consultas
// previas de cada función, que traen `temas`/`contenidos` sin filtrar por `publicado`) el chequeo de
// acá SÍ decide qué se devuelve: sin él, una sesión no-admin vería el catálogo público (con sus piezas
// publicadas) a través de las funciones del panel, porque `temas_catalogo_publico`/`contenidos_con_acceso`
// son policies permisivas que igual matchean. No es una fuga (no ve nada que no pudiera ver por las
// rutas públicas), pero rompería el "está vacío si no sos admin" que esperan estas funciones.
//
// Los archivos: `archivos_contenido` la escribe solo `guardar-archivo-bunny` (service_role) — acá
// nunca se hace `insert`/`update` directo. La subida a Bunny es directa desde el navegador por TUS
// (protocolo reanudable): `iniciar-subida-bunny` crea el video en Bunny y firma una autorización
// temporal; el archivo nunca pasa por un servidor propio (ni el de Supabase ni ningún otro), así uno
// de hasta 2GB no choca contra ningún límite de tamaño de pedido.
import * as tus from 'tus-js-client'
import { supabase } from '../lib/supabase'
import { esAdmin } from './acceso'
import { COLUMNAS_CONTENIDO, COLUMNAS_TEMA, mapContenido, mapTema } from './mapeo'
import { invocar } from './base'
import type { ArchivoSubido, DatosDeContenido, DatosDeQuienSoy, DatosDeTema, EstadoMarId, ResultadoAdmin, TemaAdmin, TipoContenido } from './tipos'

const ESTADOS: EstadoMarId[] = ['calma', 'olas_suaves', 'agitado', 'tormenta', 'profundidades', 'mareas', 'corrientes', 'horizonte']
const NO_ES_ADMIN = { ok: false, mensaje: 'No tenés permiso para hacer esto.' } as const
const NO_EXISTE = { ok: false, mensaje: 'Eso ya no existe. Recargá la página.' } as const
const ERROR_GENERICO = { ok: false, mensaje: 'No pudimos guardar. Probá de nuevo en un rato.' } as const

export const LIMITE_DE_ARCHIVO_MB: Record<'video' | 'meditacion', number> = { video: 2048, meditacion: 500 }

export async function listarTemasAdmin(): Promise<TemaAdmin[]> {
  if (!(await esAdmin())) return []
  const [{ data: temas, error: e1 }, { data: contenidos, error: e2 }, { data: archivos, error: e3 }] = await Promise.all([
    supabase.from('temas').select(COLUMNAS_TEMA).order('orden'),
    supabase.from('contenidos').select(COLUMNAS_CONTENIDO).order('orden'),
    supabase.from('archivos_contenido').select('contenido_id, nombre, bytes'),
  ])
  if (e1 || e2 || e3) throw e1 ?? e2 ?? e3
  const archivoPorContenido = new Map(archivos.map((a) => [a.contenido_id, { nombre: a.nombre, bytes: a.bytes }]))
  return temas.map(mapTema).map((t) => ({
    ...t,
    contenidos: contenidos
      .filter((c) => c.tema_id === t.id)
      .map(mapContenido)
      .map((c) => ({ ...c, archivo: archivoPorContenido.get(c.id) ?? null })),
  }))
}

// ── Ventanas ──────────────────────────────────────────────────────────────────

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
// Palabras que chocan con rutas del panel: una ventana con esa dirección no se podría volver a editar.
const RESERVADAS = ['nueva', 'nuevo', 'ventanas', 'contenidos', 'admin']
const LARGO_MAXIMO_SLUG = 60

export async function guardarTemaAdmin(slugActual: string | null, d: DatosDeTema): Promise<ResultadoAdmin> {
  if (!(await esAdmin())) return NO_ES_ADMIN
  const { data: temas, error: errorLista } = await supabase.from('temas').select('id,slug,orden')
  if (errorLista) return ERROR_GENERICO
  const existente = slugActual ? temas.find((t) => t.slug === slugActual) : undefined
  if (slugActual && !existente) return NO_EXISTE

  const errores: Record<string, string> = {}
  const titulo = d.titulo.trim()
  const slug = d.slug.trim()
  if (titulo.length < 2 || titulo.length > 80) errores.titulo = 'El título tiene que tener entre 2 y 80 caracteres.'
  if (!SLUG.test(slug) || slug.length > LARGO_MAXIMO_SLUG) errores.slug = `Usá solo minúsculas, números y guiones, hasta ${LARGO_MAXIMO_SLUG} caracteres (por ejemplo: sentido-de-la-vida).`
  else if (RESERVADAS.includes(slug)) errores.slug = 'Esa dirección está reservada. Elegí otra.'
  else if (temas.some((t) => t.slug === slug && t.id !== existente?.id)) errores.slug = 'Ya hay una ventana con esa dirección.'
  if (d.descripcion.length > 240) errores.descripcion = 'La descripción no puede pasar de 240 caracteres.'
  if (d.estadoMar && !ESTADOS.includes(d.estadoMar)) errores.estadoMar = 'Elegí un estado del mar de la lista.'
  if (Object.keys(errores).length) return { ok: false, mensaje: 'Revisá los campos marcados.', errores }

  const datos = { titulo, slug, descripcion: d.descripcion.trim() || null, estado_mar: d.estadoMar, publicado: d.publicado }
  if (existente) {
    // `.select().maybeSingle()`: si la RLS bloqueó la escritura (por ejemplo, el rol se revocó justo
    // ahora), el update no toca ninguna fila y Postgres no lo marca como error — sin este chequeo,
    // acá se contestaría "guardado" sin haber guardado nada.
    const { data: fila, error } = await supabase.from('temas').update(datos).eq('id', existente.id).select('id').maybeSingle()
    if (error) return ERROR_GENERICO
    if (!fila) return NO_EXISTE
  } else {
    const orden = Math.max(0, ...temas.map((t) => t.orden)) + 1
    const { error } = await supabase.from('temas').insert({ ...datos, orden })
    if (error) return ERROR_GENERICO
  }
  return { ok: true, slug }
}

export async function eliminarTemaAdmin(slug: string): Promise<ResultadoAdmin> {
  if (!(await esAdmin())) return NO_ES_ADMIN
  const { error } = await supabase.from('temas').delete().eq('slug', slug)
  if (error) return ERROR_GENERICO
  return { ok: true } // borrar algo ya borrado también es un éxito: el resultado deseado ya es cierto
}

export async function publicarTemaAdmin(slug: string, publicado: boolean): Promise<ResultadoAdmin> {
  if (!(await esAdmin())) return NO_ES_ADMIN
  const { data, error } = await supabase.from('temas').update({ publicado }).eq('slug', slug).select('id').maybeSingle()
  if (error) return ERROR_GENERICO
  if (!data) return NO_EXISTE
  return { ok: true }
}

// Sube o baja una ventana en el orden del catálogo: intercambia el lugar con la vecina.
export async function moverTemaAdmin(slug: string, direccion: 'arriba' | 'abajo'): Promise<ResultadoAdmin> {
  if (!(await esAdmin())) return NO_ES_ADMIN
  const { data: temas, error: errorLista } = await supabase.from('temas').select('id,slug,orden').order('orden')
  if (errorLista) return ERROR_GENERICO
  const i = temas.findIndex((t) => t.slug === slug)
  if (i < 0) return NO_EXISTE
  const j = direccion === 'arriba' ? i - 1 : i + 1
  if (j < 0 || j >= temas.length) return { ok: true }
  const [a, b] = [temas[i], temas[j]]
  const [{ data: fa, error: e1 }, { data: fb, error: e2 }] = await Promise.all([
    supabase.from('temas').update({ orden: b.orden }).eq('id', a.id).select('id').maybeSingle(),
    supabase.from('temas').update({ orden: a.orden }).eq('id', b.id).select('id').maybeSingle(),
  ])
  if (e1 || e2) return ERROR_GENERICO
  if (!fa || !fb) return NO_EXISTE
  return { ok: true }
}

// ── Piezas ────────────────────────────────────────────────────────────────────

const MINUTOS_MAXIMOS = 600

export async function guardarContenidoAdmin(
  temaSlug: string,
  contenidoId: string | null,
  d: DatosDeContenido,
  archivo?: ArchivoSubido | 'quitar',
): Promise<ResultadoAdmin> {
  if (!(await esAdmin())) return NO_ES_ADMIN
  const { data: tema, error: errorTema } = await supabase.from('temas').select('id').eq('slug', temaSlug).maybeSingle()
  if (errorTema) return ERROR_GENERICO
  if (!tema) return NO_EXISTE
  const { data: contenidos, error: errorLista } = await supabase.from('contenidos').select('id,tipo,orden').eq('tema_id', tema.id)
  if (errorLista) return ERROR_GENERICO
  const existente = contenidoId ? contenidos.find((c) => c.id === contenidoId) : undefined
  if (contenidoId && !existente) return NO_EXISTE

  const errores: Record<string, string> = {}
  const titulo = d.titulo.trim()
  if (titulo.length < 2 || titulo.length > 100) errores.titulo = 'El título tiene que tener entre 2 y 100 caracteres.'
  if (d.duracionMin !== null && (!Number.isInteger(d.duracionMin) || d.duracionMin < 1 || d.duracionMin > MINUTOS_MAXIMOS)) {
    errores.duracionMin = `La duración va de 1 a ${MINUTOS_MAXIMOS} minutos.`
  }
  if (d.tipo === 'ejercitacion') {
    const cuerpo = (d.cuerpo ?? '').trim()
    if (cuerpo.length < 10 || cuerpo.length > 5000) errores.cuerpo = 'La consigna tiene que tener entre 10 y 5000 caracteres.'
  }
  if (!existente && contenidos.some((c) => c.tipo === d.tipo)) errores.tipo = 'Esta ventana ya tiene una pieza de ese tipo.'
  if (Object.keys(errores).length) return { ok: false, mensaje: 'Revisá los campos marcados.', errores }

  const datos = { titulo, duracion_min: d.duracionMin, cuerpo: d.tipo === 'ejercitacion' ? (d.cuerpo ?? '').trim() : null, publicado: d.publicado }
  let id = existente?.id
  if (existente) {
    const { data: fila, error } = await supabase.from('contenidos').update(datos).eq('id', existente.id).select('id').maybeSingle()
    if (error) return ERROR_GENERICO
    if (!fila) return NO_EXISTE
  } else {
    const orden = Math.max(0, ...contenidos.map((c) => c.orden)) + 1
    const { data: fila, error } = await supabase.from('contenidos').insert({ tema_id: tema.id, tipo: d.tipo, orden, ...datos }).select('id').single()
    if (error || !fila) return ERROR_GENERICO
    id = fila.id
  }
  // El archivo recién se asocia acá, no cuando se subió: una pieza nueva todavía no tenía id en ese
  // momento (`iniciar-subida-bunny` no lo necesita, sube directo a Bunny) — `archivo.token` es el
  // `videoId` que devolvió esa función. `guardar-archivo-bunny` es la única que puede escribir
  // `archivos_contenido` (RLS); si falla, el resto de la pieza ya quedó guardado, pero se avisa igual
  // para que la admin sepa que el archivo no quedó asociado y pueda reintentar.
  if (id && archivo === 'quitar') {
    const r = await invocar<ResultadoAdmin>('guardar-archivo-bunny', { contenidoId: id, accion: 'quitar' })
    if (!r.ok) return r
  } else if (id && archivo && archivo !== 'quitar') {
    const r = await invocar<ResultadoAdmin>('guardar-archivo-bunny', { contenidoId: id, accion: 'guardar', videoId: archivo.token, nombre: archivo.nombre, bytes: archivo.bytes })
    if (!r.ok) return r
  }
  // `temas.piezas` (la vista pública bloqueada) la recalcula sola un trigger en la base al guardar.
  return { ok: true, id }
}

export async function eliminarContenidoAdmin(contenidoId: string): Promise<ResultadoAdmin> {
  if (!(await esAdmin())) return NO_ES_ADMIN
  // El id del video se lee ANTES de borrar la pieza: `contenidos` borra en cascada la fila de
  // `archivos_contenido`, así que si no se guarda este id ahora, después de borrar ya no hay forma de
  // encontrarlo para limpiarlo del lado de Bunny.
  const { data: archivo } = await supabase.from('archivos_contenido').select('bunny_video_id').eq('contenido_id', contenidoId).maybeSingle()
  const { data: fila, error } = await supabase.from('contenidos').delete().eq('id', contenidoId).select('id').maybeSingle()
  if (error) return ERROR_GENERICO
  if (!fila) return NO_EXISTE
  // Mejor esfuerzo, recién ahora que la pieza se borró de verdad: si Bunny está caído, no vale la pena
  // resucitar la pieza por eso — en el peor caso queda un video huérfano (solo cuesta almacenamiento,
  // no es una fuga).
  if (archivo) await invocar('guardar-archivo-bunny', { accion: 'descartar', videoId: archivo.bunny_video_id }).catch(() => undefined)
  return { ok: true }
}

// ── Quién soy ─────────────────────────────────────────────────────────────────

const MAXIMO_CAMPOS = 20

// Siempre hay una sola fila (la sembró la migración 0004; nadie puede insertar ni borrar — ni
// siquiera la admin: ver el índice único `quien_soy_fila_unica` de la migración 0005). Por eso, si el
// `update` no devuelve la fila, no es que "ya no existe" (nunca deja de existir): es que la sesión
// dejó de ser admin justo entre el chequeo de arriba y este pedido.
export async function guardarQuienSoyAdmin(d: DatosDeQuienSoy): Promise<ResultadoAdmin> {
  if (!(await esAdmin())) return NO_ES_ADMIN

  const errores: Record<string, string> = {}
  const nombre = d.nombre.trim()
  const descripcion = d.descripcion.trim()
  const fotoUrl = d.fotoUrl.trim()
  if (nombre.length > 100) errores.nombre = 'El nombre no puede pasar de 100 caracteres.'
  if (descripcion.length > 2000) errores.descripcion = 'La descripción no puede pasar de 2000 caracteres.'
  if (fotoUrl && (!/^https:\/\//.test(fotoUrl) || fotoUrl.length > 500)) errores.fotoUrl = 'Tiene que ser un enlace que empiece con https://, de hasta 500 caracteres.'
  // Una fila con la etiqueta o el valor en blanco no dice nada: se descarta sola, sin marcarla como error.
  const campos = d.campos.map((c) => ({ etiqueta: c.etiqueta.trim(), valor: c.valor.trim() })).filter((c) => c.etiqueta && c.valor)
  if (campos.length > MAXIMO_CAMPOS) errores.campos = `Hasta ${MAXIMO_CAMPOS} campos.`
  else if (campos.some((c) => c.etiqueta.length > 60 || c.valor.length > 300)) errores.campos = 'Algún campo quedó demasiado largo (el nombre hasta 60 caracteres, el valor hasta 300).'
  if (Object.keys(errores).length) return { ok: false, mensaje: 'Revisá los campos marcados.', errores }

  const { data: fila, error: errorLectura } = await supabase.from('quien_soy').select('id').maybeSingle()
  if (errorLectura) return ERROR_GENERICO
  if (!fila) return NO_EXISTE
  const { data: actualizado, error } = await supabase
    .from('quien_soy')
    .update({ nombre: nombre || null, descripcion: descripcion || null, foto_url: fotoUrl || null, campos, publicado: d.publicado })
    .eq('id', fila.id)
    .select('id')
    .maybeSingle()
  if (error) return ERROR_GENERICO
  if (!actualizado) return NO_ES_ADMIN
  return { ok: true }
}

// ── Archivos ──────────────────────────────────────────────────────────────────

type InicioDeSubida = { videoId: string; libraryId: string; authorizationSignature: string; authorizationExpire: number }

// Sube un archivo de video o audio directo al navegador de Bunny Stream, por TUS (protocolo
// reanudable): `iniciar-subida-bunny` crea el video en Bunny y firma una autorización de una hora;
// de ahí en más, el archivo viaja directo de este navegador a Bunny, nunca por un servidor propio.
// El resultado (`archivo.token`) es el id del video en Bunny: `guardarContenidoAdmin` recién lo asocia
// a la pieza cuando se guarda el formulario entero (ver el comentario de esa función).
export async function subirArchivoAdmin(
  tipo: TipoContenido,
  archivo: File,
  alAvanzar: (porcentaje: number) => void,
  senal?: AbortSignal,
): Promise<{ ok: true; archivo: ArchivoSubido } | { ok: false; mensaje: string }> {
  if (!(await esAdmin())) return { ok: false, mensaje: NO_ES_ADMIN.mensaje }
  const clase = tipo === 'video' ? 'video/' : 'audio/'
  if (tipo === 'ejercitacion' || !archivo.type.startsWith(clase)) {
    return { ok: false, mensaje: tipo === 'video' ? 'Elegí un archivo de video.' : 'Elegí un archivo de audio.' }
  }
  if (archivo.size > LIMITE_DE_ARCHIVO_MB[tipo] * 1024 * 1024) return { ok: false, mensaje: `El archivo pesa más de ${LIMITE_DE_ARCHIVO_MB[tipo]} MB.` }

  const inicio = await invocar<InicioDeSubida | { ok: false; mensaje: string }>('iniciar-subida-bunny', {
    tipo,
    nombre: archivo.name,
    bytes: archivo.size,
    tipoMime: archivo.type,
  })
  if ('ok' in inicio) return inicio

  return new Promise((resolver) => {
    const subida = new tus.Upload(archivo, {
      endpoint: 'https://video.bunnycdn.com/tusupload',
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        AuthorizationSignature: inicio.authorizationSignature,
        AuthorizationExpire: String(inicio.authorizationExpire),
        VideoId: inicio.videoId,
        LibraryId: inicio.libraryId,
      },
      metadata: { filetype: archivo.type, title: archivo.name },
      // El video que creó `iniciar-subida-bunny` queda vacío en Bunny si la subida falla: se descarta
      // solo, sin bloquear a quien está en el formulario (mejor esfuerzo — si esto también falla,
      // queda huérfano, ver el comentario de `guardar-archivo-bunny`).
      onError: () => {
        void descartarArchivoSubido(inicio.videoId)
        resolver({ ok: false, mensaje: 'No pudimos subir el archivo. Probá de nuevo.' })
      },
      onProgress: (subidos, total) => alAvanzar(Math.round((subidos / total) * 100)),
      onSuccess: () => resolver({ ok: true, archivo: { nombre: archivo.name, bytes: archivo.size, token: inicio.videoId } }),
    })
    // `subida.abort()` no dispara `onError`: hay que resolver acá mismo, o la promesa queda colgada
    // para siempre y la barra de progreso se congela.
    senal?.addEventListener('abort', () => {
      void subida.abort()
      void descartarArchivoSubido(inicio.videoId)
      resolver({ ok: false, mensaje: 'Cancelaste la subida.' })
    })
    // Sin `findPreviousUploads`/`resumeFromPreviousUpload`: cada intento crea un video nuevo en Bunny
    // (`iniciar-subida-bunny` de arriba), así que reanudar contra una subida vieja mandaría los bytes
    // al `videoId` equivocado — el nuevo quedaría vacío pero la función igual reportaría éxito.
    subida.start()
  })
}

// Borra en Bunny un video que se subió pero nunca se guardó (se canceló la subida, se sacó el archivo
// del formulario antes de mandarlo, o se abandonó el formulario sin guardar). Mejor esfuerzo: no hay
// ninguna fila en la base que dependa de esto.
export async function descartarArchivoSubido(videoId: string): Promise<void> {
  await invocar('guardar-archivo-bunny', { accion: 'descartar', videoId }).catch(() => undefined)
}
