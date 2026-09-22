// PUENTE TEMPORAL — Auth ya es real (ver SesionContext.tsx), pero `contenido.ts`/`admin.ts`
// (el catálogo y el panel) todavía son datos simulados y deciden el acceso mirando esta variable.
// SesionContext la mantiene sincronizada con el rol real después de cada cambio de sesión. Se borra
// entero, junto con este archivo, cuando la Tanda de datos conecte esas dos capas a Supabase.
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
