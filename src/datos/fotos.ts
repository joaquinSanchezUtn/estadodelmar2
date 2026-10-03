// Fotos de ventanas y temas (migraciones 0015 y 0016): las dos viven en el bucket público `publico`, cada una
// en su carpeta, y la fila guarda la ruta en su columna `foto`. Un solo camino para las dos, así las reglas
// (tipos, tamaño, orden de los pasos) no se separan con el tiempo. La barrera real son las policies
// `publico_ventanas_admin_*` / `publico_temas_admin_*` y las de cada tabla; `esAdmin()` es un aviso temprano.
import { supabase } from '../lib/supabase'
import { esAdmin } from './acceso'
import type { ResultadoAdmin } from './tipos'

export type DestinoDeFoto = { tabla: 'estados' | 'temas'; carpeta: 'ventanas' | 'temas'; id: string; nombre: string }

export const TIPOS_DE_FOTO: Record<string, 'jpg' | 'png' | 'webp'> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
export const FOTO_MAXIMA_MB = 5
const NO_ES_ADMIN = { ok: false, mensaje: 'No tenés permiso para hacer esto.' } as const
const NO_EXISTE = { ok: false, mensaje: 'Eso ya no existe. Recargá la página.' } as const
const ERROR_GENERICO = { ok: false, mensaje: 'No pudimos guardar. Probá de nuevo en un rato.' } as const

// Borra un archivo del bucket sin frenar a nadie si falla: en el peor caso queda una foto suelta.
export const borrarArchivoDeFoto = async (ruta: string | null | undefined) => {
  if (ruta) await supabase.storage.from('publico').remove([ruta])
}

// Sube la foto (ya achicada por `prepararFoto`) con un nombre nuevo, la asocia y recién ahí borra la anterior:
// si algo falla en el medio, la fila nunca queda apuntando a un archivo que no existe.
export async function subirFoto(d: DestinoDeFoto, foto: Blob): Promise<ResultadoAdmin> {
  if (!(await esAdmin())) return NO_ES_ADMIN
  const ext = TIPOS_DE_FOTO[foto.type]
  if (!ext) return { ok: false, mensaje: 'La foto tiene que ser JPG, PNG o WebP.' }
  if (foto.size > FOTO_MAXIMA_MB * 1024 * 1024) return { ok: false, mensaje: `La foto puede pesar hasta ${FOTO_MAXIMA_MB} MB.` }
  const { data: actual } = await supabase.from(d.tabla).select('foto').eq('id', d.id).maybeSingle()
  const nombre = d.nombre.replace(/[^a-z0-9-]+/g, '-').slice(0, 50) || 'foto'
  const ruta = `${d.carpeta}/${nombre}-${Date.now()}.${ext}`
  const { error: errorSubida } = await supabase.storage.from('publico').upload(ruta, foto, { contentType: foto.type, upsert: false })
  if (errorSubida) return { ok: false, mensaje: 'No pudimos subir la foto. Probá de nuevo en un rato.' }
  const { data, error } = await supabase.from(d.tabla).update({ foto: ruta }).eq('id', d.id).select('id').maybeSingle()
  if (error || !data) {
    await borrarArchivoDeFoto(ruta)
    return error ? ERROR_GENERICO : NO_EXISTE
  }
  await borrarArchivoDeFoto(actual?.foto)
  return { ok: true }
}

export async function quitarFoto(d: DestinoDeFoto): Promise<ResultadoAdmin> {
  if (!(await esAdmin())) return NO_ES_ADMIN
  const { data: actual } = await supabase.from(d.tabla).select('foto').eq('id', d.id).maybeSingle()
  const { data, error } = await supabase.from(d.tabla).update({ foto: null }).eq('id', d.id).select('id').maybeSingle()
  if (error) return ERROR_GENERICO
  if (!data) return NO_EXISTE
  await borrarArchivoDeFoto(actual?.foto)
  return { ok: true }
}
