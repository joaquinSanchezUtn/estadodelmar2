// Panel de administración: crear, editar, ordenar, publicar y borrar ventanas y sus piezas, y subir
// archivos. Ventanas y piezas ya son consultas reales a Supabase.
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
// Los archivos (Bunny Stream) siguen simulados: la tabla real `archivos_contenido` solo la escribe una
// Edge Function con service_role que todavía no existe (ver CLAUDE.md, "Para respaldar en Supabase").
// Este `Map` en memoria es un reemplazo de mentira nada más para que el panel tenga algo que mostrar
// mientras tanto; no persiste entre recargas y se vacía al cerrar sesión (`olvidarArchivos`, llamado
// desde `vaciarCache` en SesionContext).
import { supabase } from '../lib/supabase'
import { esAdmin } from './acceso'
import { COLUMNAS_CONTENIDO, COLUMNAS_TEMA, mapContenido, mapTema } from './mapeo'
import { hayDatosDePrueba, sinBackend } from './base'
import type { ArchivoDeContenido, ArchivoSubido, DatosDeContenido, DatosDeTema, EstadoMarId, ResultadoAdmin, TemaAdmin, TipoContenido } from './tipos'

const ESTADOS: EstadoMarId[] = ['calma', 'olas_suaves', 'agitado', 'tormenta', 'profundidades', 'mareas', 'corrientes', 'horizonte']
const NO_ES_ADMIN = { ok: false, mensaje: 'No tenés permiso para hacer esto.' } as const
const NO_EXISTE = { ok: false, mensaje: 'Eso ya no existe. Recargá la página.' } as const
const ERROR_GENERICO = { ok: false, mensaje: 'No pudimos guardar. Probá de nuevo en un rato.' } as const

export const LIMITE_DE_ARCHIVO_MB: Record<'video' | 'meditacion', number> = { video: 2048, meditacion: 500 }

// Los archivos "subidos", por pieza — ver el comentario de arriba: de mentira, en memoria.
const archivos = new Map<string, ArchivoDeContenido>()
export const archivoDe = (contenidoId: string): ArchivoDeContenido | null => archivos.get(contenidoId) ?? null
export const olvidarArchivos = () => archivos.clear()

export async function listarTemasAdmin(): Promise<TemaAdmin[]> {
  if (!(await esAdmin())) return []
  const [{ data: temas, error: e1 }, { data: contenidos, error: e2 }] = await Promise.all([
    supabase.from('temas').select(COLUMNAS_TEMA).order('orden'),
    supabase.from('contenidos').select(COLUMNAS_CONTENIDO).order('orden'),
  ])
  if (e1 || e2) throw e1 ?? e2
  return temas.map(mapTema).map((t) => ({
    ...t,
    contenidos: contenidos
      .filter((c) => c.tema_id === t.id)
      .map(mapContenido)
      .map((c) => ({ ...c, archivo: archivoDe(c.id) })),
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
  if (id && archivo === 'quitar') archivos.delete(id)
  else if (id && archivo && archivo !== 'quitar') archivos.set(id, { nombre: archivo.nombre, bytes: archivo.bytes })
  // `temas.piezas` (la vista pública bloqueada) la recalcula sola un trigger en la base al guardar.
  return { ok: true, id }
}

export async function eliminarContenidoAdmin(contenidoId: string): Promise<ResultadoAdmin> {
  if (!(await esAdmin())) return NO_ES_ADMIN
  const { data: fila, error } = await supabase.from('contenidos').delete().eq('id', contenidoId).select('id').maybeSingle()
  if (error) return ERROR_GENERICO
  if (!fila) return NO_EXISTE
  archivos.delete(contenidoId)
  return { ok: true }
}

// ── Archivos ──────────────────────────────────────────────────────────────────

export type ArchivoParaSubir = { nombre: string; bytes: number; tipoMime: string }

const PASOS = 12
const PASO_MS = 220

// Con Bunny Stream la subida es directa desde el navegador a una URL que crea una Edge Function (que
// verifica que sea admin); acá se simula con una barra que avanza. Se puede cancelar con la señal.
export async function subirArchivoAdmin(
  tipo: TipoContenido,
  a: ArchivoParaSubir,
  alAvanzar: (porcentaje: number) => void,
  senal?: AbortSignal,
): Promise<{ ok: true; archivo: ArchivoSubido } | { ok: false; mensaje: string }> {
  if (!hayDatosDePrueba) return sinBackend()
  if (!(await esAdmin())) return { ok: false, mensaje: NO_ES_ADMIN.mensaje }
  const clase = tipo === 'video' ? 'video/' : 'audio/'
  if (tipo === 'ejercitacion' || !a.tipoMime.startsWith(clase)) {
    return { ok: false, mensaje: tipo === 'video' ? 'Elegí un archivo de video.' : 'Elegí un archivo de audio.' }
  }
  if (a.bytes > LIMITE_DE_ARCHIVO_MB[tipo] * 1024 * 1024) return { ok: false, mensaje: `El archivo pesa más de ${LIMITE_DE_ARCHIVO_MB[tipo]} MB.` }
  for (let i = 1; i <= PASOS; i++) {
    await new Promise((r) => setTimeout(r, PASO_MS))
    if (senal?.aborted) return { ok: false, mensaje: 'Cancelaste la subida.' }
    alAvanzar(Math.round((i / PASOS) * 100))
  }
  return { ok: true, archivo: { nombre: a.nombre, bytes: a.bytes, token: `subida-${Math.random().toString(36).slice(2, 10)}` } }
}
