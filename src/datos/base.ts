// Lo que comparte la capa de datos y la de administración: cómo se llama a una Edge Function. Ningún
// componente importa este archivo.
import { supabase } from '../lib/supabase'

// Llama una Edge Function y devuelve lo que haya en el body de la respuesta, sea éxito o el
// `{ ok: false, mensaje }` que arma cada función para sus propios fracasos esperados (transición
// inválida, Mercado Pago o Bunny no contestaron, etc.). Tira solo para lo que ninguna función
// esperaría (red caída): ahí no hay ningún mensaje que leer.
export async function invocar<T>(fn: string, body?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(fn, body ? { body } : undefined)
  if (!error) return data as T
  const cuerpo = await (error as { context?: Response }).context?.json().catch(() => null)
  if (cuerpo) return cuerpo as T
  throw error
}

