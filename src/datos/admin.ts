// Panel de administración: crear, editar, ordenar, publicar y borrar ventanas y sus piezas, y subir
// archivos. Hoy opera sobre los datos de prueba en memoria; con Supabase cada función pasa a ser una
// consulta o una Edge Function.
//
// OJO: acá cada función verifica que la sesión sea admin, pero en el navegador eso es solo
// experiencia. La barrera real es la base: las policies `temas_admin` y `contenidos_admin` (es_admin())
// y las Edge Functions que suben archivos a Bunny, que tienen que volver a verificar el rol en el servidor.
import { cargarPrueba, esperar, hayDatosDePrueba, sinBackend } from './base'
import { rolSimulado } from './sesionSimulada'
import type { ArchivoDeContenido, ArchivoSubido, Contenido, DatosDeContenido, DatosDeTema, EstadoMarId, ResultadoAdmin, TemaAdmin, TipoContenido } from './tipos'

const ESTADOS: EstadoMarId[] = ['calma', 'olas_suaves', 'agitado', 'tormenta', 'profundidades', 'mareas', 'corrientes', 'horizonte']
const NO_ES_ADMIN = { ok: false, mensaje: 'No tenés permiso para hacer esto.' } as const
const NO_EXISTE = { ok: false, mensaje: 'Eso ya no existe. Recargá la página.' } as const
const esAdmin = () => rolSimulado() === 'admin'

export const LIMITE_DE_ARCHIVO_MB: Record<'video' | 'meditacion', number> = { video: 2048, meditacion: 500 }

// Los archivos subidos, por pieza. Al empezar, las piezas de las ventanas publicadas ya tienen el suyo.
const archivos = new Map<string, ArchivoDeContenido>()
let sembrado = false

async function sembrar() {
  if (sembrado) return
  sembrado = true
  const { temas, contenidos } = await cargarPrueba()
  contenidos.forEach((c) => {
    const tema = temas.find((t) => t.id === c.temaId)
    if (c.tipo !== 'ejercitacion' && tema?.publicado) archivos.set(c.id, { nombre: `${tema.slug}-${c.tipo}.${c.tipo === 'video' ? 'mp4' : 'mp3'}`, bytes: (c.tipo === 'video' ? 180 : 24) * 1024 * 1024 })
  })
}

export async function archivoDe(c: Contenido): Promise<ArchivoDeContenido | null> {
  await sembrar()
  return archivos.get(c.id) ?? null
}

// Las piezas públicas de una ventana (tipo y duración) se recalculan cada vez que cambian sus contenidos.
async function recalcularPiezas(temaId: string) {
  const { temas, contenidos } = await cargarPrueba()
  const tema = temas.find((t) => t.id === temaId)
  if (tema) {
    tema.piezas = contenidos
      .filter((c) => c.temaId === temaId && c.publicado)
      .sort((a, b) => a.orden - b.orden)
      .map(({ tipo, duracionMin }) => ({ tipo, duracionMin }))
  }
}

export async function listarTemasAdmin(): Promise<TemaAdmin[]> {
  if (!hayDatosDePrueba) return sinBackend()
  await esperar()
  if (!esAdmin()) return []
  await sembrar()
  const { temas, contenidos } = await cargarPrueba()
  return temas
    .map((t) => ({
      ...t,
      contenidos: contenidos
        .filter((c) => c.temaId === t.id)
        .sort((a, b) => a.orden - b.orden)
        .map((c) => ({ ...c, archivo: archivos.get(c.id) ?? null })),
    }))
    .sort((a, b) => a.orden - b.orden)
}

// ── Ventanas ──────────────────────────────────────────────────────────────────

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
// Palabras que chocan con rutas del panel: una ventana con esa dirección no se podría volver a editar.
const RESERVADAS = ['nueva', 'nuevo', 'ventanas', 'contenidos', 'admin']
const LARGO_MAXIMO_SLUG = 60
// Los ids no salen del slug: si se renombra o se reutiliza una dirección, dos ventanas no pueden compartir id.
const nuevoId = (prefijo: string) => `${prefijo}-${Math.random().toString(36).slice(2, 10)}`

export async function guardarTemaAdmin(slugActual: string | null, d: DatosDeTema): Promise<ResultadoAdmin> {
  if (!hayDatosDePrueba) return sinBackend()
  await esperar()
  if (!esAdmin()) return NO_ES_ADMIN
  const { temas } = await cargarPrueba()
  const existente = slugActual ? temas.find((t) => t.slug === slugActual) : undefined
  if (slugActual && !existente) return NO_EXISTE

  const errores: Record<string, string> = {}
  const titulo = d.titulo.trim()
  const slug = d.slug.trim()
  if (titulo.length < 2 || titulo.length > 80) errores.titulo = 'El título tiene que tener entre 2 y 80 caracteres.'
  if (!SLUG.test(slug) || slug.length > LARGO_MAXIMO_SLUG) errores.slug = `Usá solo minúsculas, números y guiones, hasta ${LARGO_MAXIMO_SLUG} caracteres (por ejemplo: sentido-de-la-vida).`
  else if (RESERVADAS.includes(slug)) errores.slug = 'Esa dirección está reservada. Elegí otra.'
  else if (temas.some((t) => t.slug === slug && t !== existente)) errores.slug = 'Ya hay una ventana con esa dirección.'
  if (d.descripcion.length > 240) errores.descripcion = 'La descripción no puede pasar de 240 caracteres.'
  if (d.estadoMar && !ESTADOS.includes(d.estadoMar)) errores.estadoMar = 'Elegí un estado del mar de la lista.'
  if (Object.keys(errores).length) return { ok: false, mensaje: 'Revisá los campos marcados.', errores }

  if (existente) {
    Object.assign(existente, { titulo, slug, descripcion: d.descripcion.trim(), estadoMar: d.estadoMar, publicado: d.publicado })
  } else {
    const orden = Math.max(0, ...temas.map((t) => t.orden)) + 1
    temas.push({ id: nuevoId('t'), slug, titulo, descripcion: d.descripcion.trim(), estadoMar: d.estadoMar, publicado: d.publicado, orden, piezas: [] })
  }
  return { ok: true, slug }
}

export async function eliminarTemaAdmin(slug: string): Promise<ResultadoAdmin> {
  if (!hayDatosDePrueba) return sinBackend()
  await esperar()
  if (!esAdmin()) return NO_ES_ADMIN
  const { temas, contenidos } = await cargarPrueba()
  const i = temas.findIndex((t) => t.slug === slug)
  if (i < 0) return { ok: true } // borrar algo ya borrado es un éxito: el resultado deseado ya es cierto
  const id = temas[i].id
  temas.splice(i, 1)
  for (let j = contenidos.length - 1; j >= 0; j--) {
    if (contenidos[j].temaId === id) {
      archivos.delete(contenidos[j].id)
      contenidos.splice(j, 1)
    }
  }
  return { ok: true }
}

export async function publicarTemaAdmin(slug: string, publicado: boolean): Promise<ResultadoAdmin> {
  if (!hayDatosDePrueba) return sinBackend()
  await esperar()
  if (!esAdmin()) return NO_ES_ADMIN
  const tema = (await cargarPrueba()).temas.find((t) => t.slug === slug)
  if (!tema) return NO_EXISTE
  tema.publicado = publicado
  return { ok: true }
}

// Sube o baja una ventana en el orden del catálogo: intercambia el lugar con la vecina.
export async function moverTemaAdmin(slug: string, direccion: 'arriba' | 'abajo'): Promise<ResultadoAdmin> {
  if (!hayDatosDePrueba) return sinBackend()
  await esperar()
  if (!esAdmin()) return NO_ES_ADMIN
  const ordenadas = [...(await cargarPrueba()).temas].sort((a, b) => a.orden - b.orden)
  const i = ordenadas.findIndex((t) => t.slug === slug)
  const j = direccion === 'arriba' ? i - 1 : i + 1
  if (i < 0) return NO_EXISTE
  if (j < 0 || j >= ordenadas.length) return { ok: true }
  ;[ordenadas[i].orden, ordenadas[j].orden] = [ordenadas[j].orden, ordenadas[i].orden]
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
  if (!hayDatosDePrueba) return sinBackend()
  await esperar()
  if (!esAdmin()) return NO_ES_ADMIN
  const { temas, contenidos } = await cargarPrueba()
  const tema = temas.find((t) => t.slug === temaSlug)
  const existente = contenidoId ? contenidos.find((c) => c.id === contenidoId) : undefined
  if (!tema || (contenidoId && !existente)) return NO_EXISTE

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
  if (!existente && contenidos.some((c) => c.temaId === tema.id && c.tipo === d.tipo)) {
    errores.tipo = 'Esta ventana ya tiene una pieza de ese tipo.'
  }
  if (Object.keys(errores).length) return { ok: false, mensaje: 'Revisá los campos marcados.', errores }

  const datos = { titulo, duracionMin: d.duracionMin, cuerpo: d.tipo === 'ejercitacion' ? (d.cuerpo ?? '').trim() : null, publicado: d.publicado }
  let id = existente?.id
  if (existente) Object.assign(existente, datos)
  else {
    id = nuevoId('c')
    const orden = Math.max(0, ...contenidos.filter((c) => c.temaId === tema.id).map((c) => c.orden)) + 1
    contenidos.push({ id, temaId: tema.id, tipo: d.tipo, orden, ...datos })
  }
  if (id && archivo === 'quitar') archivos.delete(id)
  else if (id && archivo && archivo !== 'quitar') archivos.set(id, { nombre: archivo.nombre, bytes: archivo.bytes })
  await recalcularPiezas(tema.id)
  return { ok: true, id }
}

export async function eliminarContenidoAdmin(contenidoId: string): Promise<ResultadoAdmin> {
  if (!hayDatosDePrueba) return sinBackend()
  await esperar()
  if (!esAdmin()) return NO_ES_ADMIN
  const { contenidos } = await cargarPrueba()
  const i = contenidos.findIndex((c) => c.id === contenidoId)
  if (i < 0) return { ok: true }
  const temaId = contenidos[i].temaId
  contenidos.splice(i, 1)
  archivos.delete(contenidoId)
  await recalcularPiezas(temaId)
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
  if (!esAdmin()) return { ok: false, mensaje: NO_ES_ADMIN.mensaje }
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
