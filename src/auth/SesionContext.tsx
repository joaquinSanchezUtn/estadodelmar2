// SESIÓN SIMULADA — se reemplaza por la sesión de Supabase Auth.
// Tiene la forma que va a tener la real: { usuario, rol, accesoActivo, cargando }.
// Ojo: esto es solo lo que el front usa para mostrar u ocultar cosas; el acceso
// real lo decide la base con RLS. En producción el rol es siempre 'visitante'.
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { fijarRolSimulado } from '../datos/sesionSimulada'
import type { Rol } from '../datos/tipos'

export type Usuario = { nombre: string; email: string }

type Sesion = {
  usuario: Usuario | null
  rol: Rol
  accesoActivo: boolean
  cargando: boolean
  // Solo existe en la simulación: la sesión real no permite cambiarse el rol.
  cambiarRol: (rol: Rol) => void
}

const usuarios: Record<Rol, Usuario | null> = {
  visitante: null,
  suscriptora: { nombre: 'Lucía Benítez', email: 'lucia@ejemplo.com' },
  admin: { nombre: 'Mariana Ríos', email: 'mariana@ejemplo.com' },
}

const SesionContext = createContext<Sesion | null>(null)

export function SesionProvider({ children }: { children: ReactNode }) {
  const [rol, setRol] = useState<Rol>('visitante')

  const valor = useMemo<Sesion>(
    () => ({
      usuario: usuarios[rol],
      rol,
      accesoActivo: rol !== 'visitante', // mismo criterio que tiene_acceso() en la base
      cargando: false,
      cambiarRol: (nuevo) => {
        fijarRolSimulado(nuevo) // primero la "base", después la interfaz
        setRol(nuevo)
      },
    }),
    [rol],
  )

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
}

export function useSesion(): Sesion {
  const sesion = useContext(SesionContext)
  if (!sesion) throw new Error('useSesion debe usarse dentro de SesionProvider')
  return sesion
}
