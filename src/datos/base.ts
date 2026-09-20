// Lo que comparten la capa de datos y la de administración: de dónde salen los datos de prueba y cómo se
// simula la espera de la red. Ningún componente importa este archivo.
export type DatosDePrueba = Pick<typeof import('./mock'), 'estados' | 'temas' | 'contenidos'>
const sinDatos: DatosDePrueba = { estados: [], temas: [], contenidos: [] }

// Los datos de prueba solo existen en desarrollo o si se compila con
// VITE_DATOS_DE_PRUEBA=true (una demo, a propósito). En cualquier otro build el
// archivo mock ni se emite, así que sus textos no viajan al navegador.
export const hayDatosDePrueba = import.meta.env.DEV || import.meta.env.VITE_DATOS_DE_PRUEBA === 'true'

export async function cargarPrueba(): Promise<DatosDePrueba> {
  return hayDatosDePrueba ? import('./mock') : sinDatos
}

// Las acciones de suscripción son simuladas: sin datos de prueba no hay nada que llamar todavía
// (con Mercado Pago van a ser Edge Functions). La condición se resuelve al compilar, así que en un
// build real el código simulado ni entra al bundle.
export const sinBackend = (): never => {
  throw new Error('Todavía no hay backend conectado')
}

const RETARDO_MS = 150
export const esperar = () => new Promise<void>((resolver) => setTimeout(resolver, RETARDO_MS))

