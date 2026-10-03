// Frases del día (Semillas del mar y Ecos del océano, ver `seccionesDeFrases.ts`): una por día para quien
// visita, y la lista completa para la dueña en el panel. Como en `admin.ts`, `esAdmin()` es solo un mensaje
// temprano: la barrera real de las escrituras son las policies `*_admin` de cada tabla.
import { supabase } from '../lib/supabase'
import { esAdmin } from './acceso'
import { g, SECCIONES_DE_FRASES, type SeccionDeFrases } from './seccionesDeFrases'
import type { ResultadoAdmin } from './tipos'

export type FraseAdmin = { id: string; numero: number; texto: string; publicado: boolean }

export const LARGO_MAXIMO_DE_FRASE = 500
const NO_ES_ADMIN = { ok: false, mensaje: 'No tenés permiso para hacer esto.' } as const
const ERROR_GENERICO = { ok: false, mensaje: 'No pudimos guardar. Probá de nuevo en un rato.' } as const

const tabla = (s: SeccionDeFrases) => supabase.from(SECCIONES_DE_FRASES[s].tabla)
const yaNoExiste = (s: SeccionDeFrases) => {
  const c = SECCIONES_DE_FRASES[s]
  return { ok: false, mensaje: `${g(c, 'Esa', 'Ese')} ${c.singular} ya no existe. Recargá la página.` } as const
}

// Las publicadas, en el orden de la rotación. La RLS ya deja afuera las ocultas; el filtro va igual para
// que la admin (que las lee todas) vea en el sitio la misma rotación que el resto.
export async function listarFrases(s: SeccionDeFrases): Promise<string[]> {
  const { data, error } = await tabla(s).select('texto').eq('publicado', true).order('numero')
  if (error) throw error
  return data.map((e) => e.texto)
}

export async function listarFrasesAdmin(s: SeccionDeFrases): Promise<FraseAdmin[]> {
  if (!(await esAdmin())) return []
  const { data, error } = await tabla(s).select('id, numero, texto, publicado').order('numero', { ascending: false })
  if (error) throw error
  return data
}

// Varias de un saque, una por renglón (así puede pegar una tanda de su documento). Sin renglones vacíos.
export const separarFrases = (texto: string) =>
  texto
    .split('\n')
    .map((t) => t.trim())
    .filter(Boolean)

export async function agregarFrasesAdmin(s: SeccionDeFrases, textos: string[]): Promise<ResultadoAdmin> {
  const c = SECCIONES_DE_FRASES[s]
  if (!(await esAdmin())) return NO_ES_ADMIN
  if (textos.length === 0) return { ok: false, mensaje: `Escribí al menos ${g(c, 'una', 'un')} ${c.singular}.` }
  if (textos.some((t) => t.length > LARGO_MAXIMO_DE_FRASE)) return { ok: false, mensaje: `Cada ${c.singular} puede tener hasta ${LARGO_MAXIMO_DE_FRASE} caracteres.` }
  const { error } = await tabla(s).insert(textos.map((texto) => ({ texto })))
  return error ? ERROR_GENERICO : { ok: true }
}

async function actualizar(s: SeccionDeFrases, id: string, cambios: { texto?: string; publicado?: boolean }): Promise<ResultadoAdmin> {
  if (!(await esAdmin())) return NO_ES_ADMIN
  const { data, error } = await tabla(s).update(cambios).eq('id', id).select('id').maybeSingle()
  if (error) return ERROR_GENERICO
  return data ? { ok: true } : yaNoExiste(s)
}

export async function editarFraseAdmin(s: SeccionDeFrases, id: string, texto: string): Promise<ResultadoAdmin> {
  const c = SECCIONES_DE_FRASES[s]
  const limpio = texto.trim()
  if (!limpio) return { ok: false, mensaje: `${g(c, 'La', 'El')} ${c.singular} no puede quedar ${g(c, 'vacía', 'vacío')}.` }
  if (limpio.length > LARGO_MAXIMO_DE_FRASE) return { ok: false, mensaje: `Hasta ${LARGO_MAXIMO_DE_FRASE} caracteres.` }
  return actualizar(s, id, { texto: limpio })
}

export const publicarFraseAdmin = (s: SeccionDeFrases, id: string, publicado: boolean) => actualizar(s, id, { publicado })

export async function eliminarFraseAdmin(s: SeccionDeFrases, id: string): Promise<ResultadoAdmin> {
  if (!(await esAdmin())) return NO_ES_ADMIN
  const { data, error } = await tabla(s).delete().eq('id', id).select('id').maybeSingle()
  if (error) return ERROR_GENERICO
  return data ? { ok: true } : yaNoExiste(s)
}
