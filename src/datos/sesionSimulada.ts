// DATOS DE PRUEBA — se borra cuando entra Supabase.
// Lo que en producción deduce la base a partir de la sesión (el JWT), acá se
// simula con una variable. La escribe SesionContext y la lee contenido.ts.
import type { Rol } from './tipos'

let rol: Rol = 'visitante'

export const rolSimulado = () => rol

export const fijarRolSimulado = (nuevo: Rol) => {
  rol = nuevo
}

// Equivale a tiene_acceso() en la base: suscripción activa, o admin.
// Es exhaustivo a propósito: al sumar un rol, el compilador obliga a decidir si tiene acceso.
const conAcceso: Record<Rol, boolean> = {
  visitante: false,
  registrada: false,
  suscriptora: true,
  admin: true,
}
export const accesoSimulado = (r: Rol) => conAcceso[r]
