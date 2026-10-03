// Las ventanas (tabla `estados`, migración 0015): la fila que llega de Supabase y lo que hace el panel con
// ellas. Como en `admin.ts`, `esAdmin()` es solo un mensaje temprano: la barrera real son las policies
// (`estados_admin` en la tabla y `publico_ventanas_admin_*` en Storage).
import { urlPublica } from '../lib/activos'
import { supabase } from '../lib/supabase'
import { esAdmin } from './acceso'
import { estilos } from './constantes'
import type { DatosDeEstado, EstadoMar, EstadoMarAdmin, EstiloId, ResultadoAdmin } from './tipos'

type FilaEstado = { id: string; nombre: string; estado_interno: string; ensenanza: string; estilo: EstiloId; foto: string | null; orden: number; publicado: boolean }

export const COLUMNAS_ESTADO = 'id,nombre,estado_interno,ensenanza,estilo,foto,orden,publicado'
export const mapEstado = (f: FilaEstado): EstadoMar => ({
  id: f.id,
  nombre: f.nombre,
  estadoInterno: f.estado_interno,
  ensenanza: f.ensenanza,
  estilo: f.estilo,
  fotoUrl: f.foto ? urlPublica(f.foto) : null,
})
const mapEstadoAdmin = (f: FilaEstado): EstadoMarAdmin => ({ ...mapEstado(f), foto: f.foto, orden: f.orden, publicado: f.publicado })

const NO_ES_ADMIN = { ok: false, mensaje: 'No tenés permiso para hacer esto.' } as const
const NO_EXISTE = { ok: false, mensaje: 'Esa ventana ya no existe. Recargá la página.' } as const
const ERROR_GENERICO = { ok: false, mensaje: 'No pudimos guardar. Probá de nuevo en un rato.' } as const
export const TIPOS_DE_FOTO: Record<string, 'jpg' | 'png' | 'webp'> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
export const FOTO_MAXIMA_MB = 5

export async function listarEstadosAdmin(): Promise<EstadoMarAdmin[]> {
  if (!(await esAdmin())) return []
  const { data, error } = await supabase.from('estados').select(COLUMNAS_ESTADO).order('orden')
  if (error) throw error
  return data.map(mapEstadoAdmin)
}

// El id sale del nombre al crearla y no cambia más: va en la URL (/estado/mar-en-calma) y en los temas.
export const idDesdeNombre = (nombre: string) =>
  nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40)
    .replace(/_+$/, '')

function validar(d: DatosDeEstado): Record<string, string> {
  const e: Record<string, string> = {}
  if (!d.nombre.trim() || d.nombre.trim().length > 60) e.nombre = 'Entre 1 y 60 caracteres.'
  if (!d.estadoInterno.trim() || d.estadoInterno.trim().length > 200) e.estadoInterno = 'Entre 1 y 200 caracteres.'
  if (!d.ensenanza.trim() || d.ensenanza.trim().length > 300) e.ensenanza = 'Entre 1 y 300 caracteres.'
  if (!estilos.some((s) => s.id === d.estilo)) e.estilo = 'Elegí un aspecto de la lista.'
  return e
}

// Crea (idActual null) o edita una ventana. Devuelve su id.
export async function guardarEstadoAdmin(idActual: string | null, d: DatosDeEstado): Promise<ResultadoAdmin> {
  if (!(await esAdmin())) return NO_ES_ADMIN
  const errores = validar(d)
  if (Object.keys(errores).length) return { ok: false, mensaje: 'Revisá los campos marcados.', errores }
  const fila = { nombre: d.nombre.trim(), estado_interno: d.estadoInterno.trim(), ensenanza: d.ensenanza.trim(), estilo: d.estilo, publicado: d.publicado }

  if (idActual) {
    const { data, error } = await supabase.from('estados').update(fila).eq('id', idActual).select('id').maybeSingle()
    if (error) return ERROR_GENERICO
    return data ? { ok: true, id: idActual } : NO_EXISTE
  }

  const id = idDesdeNombre(d.nombre)
  if (!id) return { ok: false, mensaje: 'Revisá los campos marcados.', errores: { nombre: 'Usá al menos una letra o un número.' } }
  const { data: ultima } = await supabase.from('estados').select('orden').order('orden', { ascending: false }).limit(1).maybeSingle()
  const { error } = await supabase.from('estados').insert({ id, ...fila, orden: (ultima?.orden ?? 0) + 1 })
  if (error?.code === '23505') return { ok: false, mensaje: 'Revisá los campos marcados.', errores: { nombre: 'Ya hay una ventana con un nombre igual o muy parecido.' } }
  return error ? ERROR_GENERICO : { ok: true, id }
}

export async function moverEstadoAdmin(id: string, direccion: 'arriba' | 'abajo'): Promise<ResultadoAdmin> {
  if (!(await esAdmin())) return NO_ES_ADMIN
  const { data: filas, error } = await supabase.from('estados').select('id,orden').order('orden')
  if (error) return ERROR_GENERICO
  const i = filas.findIndex((f) => f.id === id)
  const j = direccion === 'arriba' ? i - 1 : i + 1
  if (i < 0) return NO_EXISTE
  if (j < 0 || j >= filas.length) return { ok: true }
  // Se renumeran todas en el orden nuevo: así dos con el mismo `orden` no quedan trabadas.
  const orden = filas.map((f) => f.id)
  ;[orden[i], orden[j]] = [orden[j], orden[i]]
  const resultados = await Promise.all(orden.map((fid, k) => supabase.from('estados').update({ orden: k + 1 }).eq('id', fid)))
  return resultados.some((r) => r.error) ? ERROR_GENERICO : { ok: true }
}

export async function eliminarEstadoAdmin(id: string): Promise<ResultadoAdmin> {
  if (!(await esAdmin())) return NO_ES_ADMIN
  const { data, error } = await supabase.from('estados').delete().eq('id', id).select('foto').maybeSingle()
  // 23503: la base no deja borrar una ventana con temas adentro (`on delete restrict`).
  if (error?.code === '23503') return { ok: false, mensaje: 'Esta ventana tiene temas adentro. Pasalos a otra ventana (desde Temas) antes de borrarla.' }
  if (error) return ERROR_GENERICO
  if (!data) return NO_EXISTE
  if (data.foto) await supabase.storage.from('publico').remove([data.foto])
  return { ok: true }
}

// Sube la foto (ya achicada por `prepararFoto`) con un nombre nuevo, la asocia y recién ahí borra la anterior:
// si algo falla en el medio, la ventana nunca queda apuntando a un archivo que no existe.
export async function subirFotoEstadoAdmin(id: string, foto: Blob): Promise<ResultadoAdmin> {
  if (!(await esAdmin())) return NO_ES_ADMIN
  const ext = TIPOS_DE_FOTO[foto.type]
  if (!ext) return { ok: false, mensaje: 'La foto tiene que ser JPG, PNG o WebP.' }
  if (foto.size > FOTO_MAXIMA_MB * 1024 * 1024) return { ok: false, mensaje: `La foto puede pesar hasta ${FOTO_MAXIMA_MB} MB.` }
  const { data: actual } = await supabase.from('estados').select('foto').eq('id', id).maybeSingle()
  const ruta = `ventanas/${id.replace(/_/g, '-')}-${Date.now()}.${ext}`
  const { error: errorSubida } = await supabase.storage.from('publico').upload(ruta, foto, { contentType: foto.type, upsert: false })
  if (errorSubida) return { ok: false, mensaje: 'No pudimos subir la foto. Probá de nuevo en un rato.' }
  const { data, error } = await supabase.from('estados').update({ foto: ruta }).eq('id', id).select('id').maybeSingle()
  if (error || !data) {
    await supabase.storage.from('publico').remove([ruta])
    return error ? ERROR_GENERICO : NO_EXISTE
  }
  if (actual?.foto) await supabase.storage.from('publico').remove([actual.foto])
  return { ok: true }
}

export async function quitarFotoEstadoAdmin(id: string): Promise<ResultadoAdmin> {
  if (!(await esAdmin())) return NO_ES_ADMIN
  const { data: actual } = await supabase.from('estados').select('foto').eq('id', id).maybeSingle()
  const { data, error } = await supabase.from('estados').update({ foto: null }).eq('id', id).select('id').maybeSingle()
  if (error) return ERROR_GENERICO
  if (!data) return NO_EXISTE
  if (actual?.foto) await supabase.storage.from('publico').remove([actual.foto])
  return { ok: true }
}
