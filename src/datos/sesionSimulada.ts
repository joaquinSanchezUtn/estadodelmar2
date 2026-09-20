// DATOS DE PRUEBA — se borra cuando entra Supabase.
// Lo que en producción deduce la base a partir de la sesión (el JWT), acá se
// simula con una variable. La escribe SesionContext y la lee contenido.ts.
import type { Rol, Usuario } from './tipos'

let rol: Rol = 'visitante'

export const rolSimulado = () => rol

export const fijarRolSimulado = (nuevo: Rol) => {
  rol = nuevo
}

// Equivale a tiene_acceso() en la base: suscripción activa, o admin.
export const accesoSimulado = (r: Rol) => r === 'suscriptora' || r === 'admin'

const usuarios: Record<Rol, Usuario | null> = {
  visitante: null,
  registrada: { nombre: 'Sofía Acosta', email: 'sofia@ejemplo.com' },
  suscriptora: { nombre: 'Lucía Benítez', email: 'lucia@ejemplo.com' },
  admin: { nombre: 'Mariana Ríos', email: 'mariana@ejemplo.com' },
}

// Solo se usa en desarrollo: en producción no hay usuarios de ejemplo en el bundle.
export const usuarioSimulado = (r: Rol) => usuarios[r]
