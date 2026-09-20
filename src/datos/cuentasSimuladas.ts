// DATOS DE PRUEBA — se borra cuando entra Supabase Auth.
// La "base de cuentas" del desarrollo: vive en memoria y se reinicia al recargar. Nunca debe
// llegar al bundle de producción: solo se importa detrás de `import.meta.env.DEV`.
import type { ErrorAuth } from '../auth/tipos'
import { enDias } from './suscripcionSimulada'
import type { Rol, Suscripcion } from './tipos'

export type Cuenta = { nombre: string; email: string; rol: Exclude<Rol, 'visitante'>; conGoogle: boolean }
type Registro = Cuenta & { contrasena: string; confirmada: boolean }

const sinGoogle = { conGoogle: false }

export const CONTRASENA_DE_PRUEBA = 'mar12345'

const iniciales = (): Registro[] => [
  { nombre: 'Sofía Acosta', email: 'sofia@ejemplo.com', rol: 'registrada', contrasena: CONTRASENA_DE_PRUEBA, confirmada: true, ...sinGoogle },
  { nombre: 'Lucía Benítez', email: 'lucia@ejemplo.com', rol: 'suscriptora', contrasena: CONTRASENA_DE_PRUEBA, confirmada: true, ...sinGoogle },
  { nombre: 'Mariana Ríos', email: 'mariana@ejemplo.com', rol: 'admin', contrasena: CONTRASENA_DE_PRUEBA, confirmada: true, ...sinGoogle },
]

let registros: Registro[] | null = null
const todas = () => (registros ??= iniciales())
let pendienteDeConfirmar: string | null = null
let pendienteDeRecuperar: string | null = null

const normal = (email: string) => email.trim().toLowerCase()
const publica = ({ nombre, email, rol, conGoogle }: Registro): Cuenta => ({ nombre, email, rol, conGoogle })
const buscar = (email: string) => todas().find((r) => r.email === normal(email))

// La cuenta de ejemplo de cada rol, para el conmutador de desarrollo.
export const cuentaDeEjemplo = (rol: Rol): Cuenta | null => {
  const r = todas().find((x) => x.rol === rol && x.email.endsWith('@ejemplo.com'))
  return r ? publica(r) : null
}

export function verificarIngreso(email: string, contrasena: string): { cuenta: Cuenta } | { error: ErrorAuth } {
  const r = buscar(email)
  if (!r || !r.contrasena || r.contrasena !== contrasena) return { error: 'credenciales' }
  if (!r.confirmada) return { error: 'sin-confirmar' }
  return { cuenta: publica(r) }
}

// Si el email ya existe no se crea nada ni se avisa: igual que la respuesta neutra del servidor.
export function crearCuenta(nombre: string, email: string, contrasena: string) {
  if (buscar(email)) return
  todas().push({ nombre: nombre.trim(), email: normal(email), rol: 'registrada', contrasena, confirmada: false, conGoogle: false })
  pendienteDeConfirmar = normal(email)
}

export function confirmarPendiente(): Cuenta | null {
  const r = pendienteDeConfirmar ? buscar(pendienteDeConfirmar) : undefined
  pendienteDeConfirmar = null
  if (!r) return null
  r.confirmada = true
  return publica(r)
}

export function marcarConfirmacion(email: string) {
  const r = buscar(email)
  if (r && !r.confirmada) pendienteDeConfirmar = r.email
}

export function marcarRecuperacion(email: string) {
  pendienteDeRecuperar = buscar(email) ? normal(email) : null
}

export function tomarRecuperacion(): Cuenta | null {
  const r = pendienteDeRecuperar ? buscar(pendienteDeRecuperar) : undefined
  pendienteDeRecuperar = null
  return r ? publica(r) : null
}

export function cuentaDeGoogle(): Cuenta {
  const existente = buscar('valentina@ejemplo.com')
  if (existente) return publica(existente)
  const nueva: Registro = { nombre: 'Valentina Suárez', email: 'valentina@ejemplo.com', rol: 'registrada', contrasena: '', confirmada: true, conGoogle: true }
  todas().push(nueva)
  return publica(nueva)
}

export function cambiarContrasenaDe(email: string, nueva: string) {
  const r = buscar(email)
  if (r) r.contrasena = nueva
}

export function renombrar(email: string, nombre: string) {
  const r = buscar(email)
  if (r) r.nombre = nombre.trim()
}

export function eliminarRegistro(email: string) {
  registros = todas().filter((r) => r.email !== normal(email))
}

// La suscripción con la que arranca cada cuenta de ejemplo (el resto empieza sin ninguna).
export const semillaDeSuscripcion = (cuenta: Cuenta): Suscripcion | null =>
  cuenta.email === 'lucia@ejemplo.com'
    ? { estado: 'activa', proximoCobro: enDias(16), medioDePago: 'Visa terminada en 4242' }
    : null
