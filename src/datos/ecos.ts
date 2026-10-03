// Ecos del océano (tabla `ecos`, migración 0013): uno por día para quien visita, y la lista completa
// para la dueña en /admin/ecos. Como en `admin.ts`, `esAdmin()` es solo un mensaje temprano: la barrera
// real de las escrituras es la policy `ecos_admin`.
import { supabase } from '../lib/supabase'
import { esAdmin } from './acceso'
import type { ResultadoAdmin } from './tipos'

export type EcoAdmin = { id: string; numero: number; texto: string; publicado: boolean }

export const LARGO_MAXIMO_DE_ECO = 500
const NO_ES_ADMIN = { ok: false, mensaje: 'No tenés permiso para hacer esto.' } as const
const ERROR_GENERICO = { ok: false, mensaje: 'No pudimos guardar. Probá de nuevo en un rato.' } as const

// Los publicados, en el orden de la rotación. La RLS ya deja afuera los ocultos; el filtro va igual para
// que la admin (que los lee todos) vea en el sitio la misma rotación que el resto.
export async function listarEcos(): Promise<string[]> {
  const { data, error } = await supabase.from('ecos').select('texto').eq('publicado', true).order('numero')
  if (error) throw error
  return data.map((e) => e.texto)
}

export async function listarEcosAdmin(): Promise<EcoAdmin[]> {
  if (!(await esAdmin())) return []
  const { data, error } = await supabase.from('ecos').select('id, numero, texto, publicado').order('numero', { ascending: false })
  if (error) throw error
  return data
}

// Varios de un saque, uno por renglón (así puede pegar una tanda de su documento). Sin renglones vacíos.
export const separarEcos = (texto: string) =>
  texto
    .split('\n')
    .map((t) => t.trim())
    .filter(Boolean)

export async function agregarEcosAdmin(textos: string[]): Promise<ResultadoAdmin> {
  if (!(await esAdmin())) return NO_ES_ADMIN
  if (textos.length === 0) return { ok: false, mensaje: 'Escribí al menos un eco.' }
  if (textos.some((t) => t.length > LARGO_MAXIMO_DE_ECO)) return { ok: false, mensaje: `Cada eco puede tener hasta ${LARGO_MAXIMO_DE_ECO} caracteres.` }
  const { error } = await supabase.from('ecos').insert(textos.map((texto) => ({ texto })))
  return error ? ERROR_GENERICO : { ok: true }
}

async function actualizar(id: string, cambios: { texto?: string; publicado?: boolean }): Promise<ResultadoAdmin> {
  if (!(await esAdmin())) return NO_ES_ADMIN
  const { data, error } = await supabase.from('ecos').update(cambios).eq('id', id).select('id').maybeSingle()
  if (error) return ERROR_GENERICO
  return data ? { ok: true } : { ok: false, mensaje: 'Ese eco ya no existe. Recargá la página.' }
}

export async function editarEcoAdmin(id: string, texto: string): Promise<ResultadoAdmin> {
  const limpio = texto.trim()
  if (!limpio) return { ok: false, mensaje: 'El eco no puede quedar vacío.' }
  if (limpio.length > LARGO_MAXIMO_DE_ECO) return { ok: false, mensaje: `Hasta ${LARGO_MAXIMO_DE_ECO} caracteres.` }
  return actualizar(id, { texto: limpio })
}

export const publicarEcoAdmin = (id: string, publicado: boolean) => actualizar(id, { publicado })

export async function eliminarEcoAdmin(id: string): Promise<ResultadoAdmin> {
  if (!(await esAdmin())) return NO_ES_ADMIN
  const { data, error } = await supabase.from('ecos').delete().eq('id', id).select('id').maybeSingle()
  if (error) return ERROR_GENERICO
  return data ? { ok: true } : { ok: false, mensaje: 'Ese eco ya no existe. Recargá la página.' }
}
