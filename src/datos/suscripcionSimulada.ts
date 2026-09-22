// DATOS DE PRUEBA — simula lo que en producción hacen Mercado Pago, su webhook y la base: el estado
// de la suscripción de la sesión actual y sus transiciones. Es un único valor global, sin atarlo a
// ninguna identidad: en desarrollo lo cambia el botón de ConmutadorDev, para poder ver cada tarjeta
// de Mi cuenta sin depender de tener suscripciones reales cargadas. Se borra cuando la Tanda de
// datos conecte Mi cuenta a la tabla real `suscripciones`.
import type { Suscripcion } from './tipos'

export type ResultadoDePago = 'aprobado' | 'pendiente' | 'rechazado'

let actual: Suscripcion | null = null

const dos = (n: number) => String(n).padStart(2, '0')
export const enDias = (dias: number) => {
  const f = new Date()
  f.setDate(f.getDate() + dias)
  return `${f.getFullYear()}-${dos(f.getMonth() + 1)}-${dos(f.getDate())}`
}

// Una cancelada tiene acceso solo mientras el período pago sigue vigente. Mercado Pago no avisa cuando
// ese período termina, así que la fecha se compara en cada consulta (la base tiene que hacer lo mismo).
export const periodoVigente = (accesoHasta: string) => accesoHasta >= enDias(0)

export const suscripcionSimulada = () => actual
export const fijarSuscripcionSimulada = (s: Suscripcion | null) => {
  actual = s
}

// Cada intento de pago tiene su identificador (en Mercado Pago, el preapproval_id que vuelve en la URL).
// La pantalla de resultado consulta ESE pago: no el estado general de la persona, que podría ser de antes.
export type EstadoDelPago = ResultadoDePago | 'procesando' | 'desconocido'
const pagos = new Map<string, EstadoDelPago>()

export function nuevoPago() {
  const id = `pago-${Math.random().toString(36).slice(2, 10)}`
  pagos.set(id, 'procesando')
  return id
}

export const estadoDelPago = (id: string): EstadoDelPago => pagos.get(id) ?? 'desconocido'

// Lo que decide Mercado Pago en su pantalla de pago (y el webhook le cuenta a la base).
export function resolverPago(id: string, resultado: ResultadoDePago) {
  if (!pagos.has(id)) return
  pagos.set(id, resultado)
  if (resultado === 'aprobado') {
    fijarSuscripcionSimulada({ estado: 'activa', proximoCobro: enDias(30), medioDePago: 'Visa terminada en 4242' })
  } else if (resultado === 'pendiente') {
    fijarSuscripcionSimulada({ estado: 'pendiente' })
  }
  // 'rechazado': no cambia nada; la suscripción sigue como estaba.
}
