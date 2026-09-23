// Lo que comparten la capa de datos y la de administración: qué queda simulado, cómo se simula la
// espera de la red, y cómo se llama a una Edge Function. Ningún componente importa este archivo.
//
// El catálogo (temas y contenidos), la suscripción (Mercado Pago) y los archivos (Bunny Stream) ya no
// dependen de esto: son reales. Esta bandera sigue viva solo para el contacto, que todavía no tiene
// backend. Se resuelve al compilar, así que en un build real ese código simulado ni entra al bundle.
import { supabase } from '../lib/supabase'

export const hayDatosDePrueba = import.meta.env.DEV || import.meta.env.VITE_DATOS_DE_PRUEBA === 'true'
export const sinBackend = (): never => {
  throw new Error('Todavía no hay backend conectado')
}

const RETARDO_MS = 150
export const esperar = () => new Promise<void>((resolver) => setTimeout(resolver, RETARDO_MS))

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

