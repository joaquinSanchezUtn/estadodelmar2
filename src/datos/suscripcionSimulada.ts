// DATOS DE PRUEBA — simula lo que en producción hacen Mercado Pago, su webhook y la base: el estado
// de la suscripción de la sesión actual y sus transiciones. Sin datos personales (no lleva emails):
// las cuentas de ejemplo están en cuentasSimuladas.ts, que nunca llega a producción.
import type { Rol, Suscripcion } from './tipos'

export type ResultadoDePago = 'aprobado' | 'pendiente' | 'rechazado'

let actual: Suscripcion | null = null
let clave: string | null = null
const guardadas = new Map<string, Suscripcion | null>()

const dos = (n: number) => String(n).padStart(2, '0')
export const enDias = (dias: number) => {
  const f = new Date()
  f.setDate(f.getDate() + dias)
  return `${f.getFullYear()}-${dos(f.getMonth() + 1)}-${dos(f.getDate())}`
}

// Una cancelada tiene acceso solo mientras el período pago sigue vigente. Mercado Pago no avisa cuando
// ese período termina, así que la fecha se compara en cada consulta (la base tiene que hacer lo mismo).
export const periodoVigente = (accesoHasta: string) => accesoHasta >= enDias(0)

// Equivale a tiene_acceso() en la base: activa, cancelada con período vigente, o admin.
export const accesoDe = (s: Suscripcion | null) =>
  s?.estado === 'activa' || s?.estado === 'administradora' || (s?.estado === 'cancelada' && periodoVigente(s.accesoHasta))

// El rol que corresponde a una cuenta según su suscripción (el admin no depende de ella).
export const rolDe = (rolBase: Exclude<Rol, 'visitante'>, s: Suscripcion | null): Rol =>
  rolBase === 'admin' ? 'admin' : accesoDe(s) ? 'suscriptora' : 'registrada'

export const suscripcionSimulada = () => actual

// Al abrir sesión se recupera lo que esa cuenta tenía; si es la primera vez, arranca de la semilla.
export function entrarSuscripcion(email: string | null, semilla: Suscripcion | null) {
  clave = email
  actual = email ? (guardadas.has(email) ? (guardadas.get(email) ?? null) : semilla) : null
}

export function fijarSuscripcionSimulada(s: Suscripcion | null) {
  actual = s
  if (clave) guardadas.set(clave, s)
}

export const olvidarSuscripcion = (email: string) => guardadas.delete(email)

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
