// Lo que comparten la capa de datos y la de administración: qué queda simulado (pago, contacto,
// medio) y cómo se simula la espera de la red. Ningún componente importa este archivo.
//
// El catálogo (temas y contenidos) ya no depende de esto: es real desde la Tanda de datos. Esta
// bandera sigue viva para lo que todavía no tiene backend (Mercado Pago, Bunny Stream, el contacto).
// Se resuelve al compilar, así que en un build real ese código simulado ni entra al bundle.
export const hayDatosDePrueba = import.meta.env.DEV || import.meta.env.VITE_DATOS_DE_PRUEBA === 'true'
export const sinBackend = (): never => {
  throw new Error('Todavía no hay backend conectado')
}

const RETARDO_MS = 150
export const esperar = () => new Promise<void>((resolver) => setTimeout(resolver, RETARDO_MS))

