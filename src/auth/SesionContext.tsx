// SESIÓN SIMULADA — se reemplaza por la sesión de Supabase Auth.
// Tiene la forma que va a tener la real: { usuario, rol, accesoActivo, cargando }.
// Es lo que el front usa para mostrar u ocultar cosas; el acceso real lo decide
// la base con RLS. En producción el rol es siempre 'visitante' y no hay setter.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { accesoSimulado, fijarRolSimulado, usuarioSimulado } from '../datos/sesionSimulada'
import type { Rol, Usuario } from '../datos/tipos'

export type Sesion = {
  usuario: Usuario | null
  rol: Rol
  accesoActivo: boolean
  cargando: boolean
}

// El setter no forma parte del contrato de sesión: solo existe en desarrollo.
type SesionConSetter = Sesion & { cambiarRol?: (rol: Rol) => void }

const SesionContext = createContext<SesionConSetter | null>(null)

export function SesionProvider({ children }: { children: ReactNode }) {
  const [rol, setRol] = useState<Rol>('visitante')
  const [cargando, setCargando] = useState(true)

  // La sesión real se resuelve de forma asíncrona: las pantallas ya se escriben
  // contra ese estado de carga.
  useEffect(() => setCargando(false), [])

  const valor = useMemo<SesionConSetter>(
    () => ({
      usuario: import.meta.env.DEV ? usuarioSimulado(rol) : null,
      rol,
      accesoActivo: accesoSimulado(rol),
      cargando,
      ...(import.meta.env.DEV && {
        cambiarRol: (nuevo: Rol) => {
          fijarRolSimulado(nuevo) // primero la "base", después la interfaz
          setRol(nuevo)
        },
      }),
    }),
    [rol, cargando],
  )

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
}

export function useSesion(): Sesion {
  const sesion = useContext(SesionContext)
  if (!sesion) throw new Error('useSesion debe usarse dentro de SesionProvider')
  return sesion
}

// SOLO DESARROLLO: lo usa ConmutadorDev. Falla si el setter no existe.
export function useSesionDev() {
  const sesion = useContext(SesionContext)
  if (!sesion?.cambiarRol) throw new Error('El cambio de rol solo existe en desarrollo')
  return { rol: sesion.rol, cambiarRol: sesion.cambiarRol }
}
