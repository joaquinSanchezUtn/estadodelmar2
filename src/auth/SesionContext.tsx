// SESIÓN SIMULADA — se reemplaza por la sesión de Supabase Auth.
// Tiene la forma que va a tener la real: { usuario, rol, accesoActivo, cargando, acciones de acceso }.
// Es lo que el front usa para mostrar u ocultar cosas; el acceso real lo decide la base con RLS.
// En producción el rol es siempre 'visitante' y no hay setter ni cuentas de ejemplo.
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { cuentaDeEjemplo, type Cuenta } from '../datos/cuentasSimuladas'
import { accesoSimulado, fijarRolSimulado } from '../datos/sesionSimulada'
import { vaciarCache } from '../lib/useCarga'
import type { Rol, Usuario } from '../datos/tipos'
import { entrarSuscripcion } from '../datos/suscripcionSimulada'
import { abrirSesionSimulada, crearAcciones, sinAcceso } from './accionesSimuladas'
import type { AccionesDeAcceso, AccionesDeCuenta } from './tipos'

export type Sesion = AccionesDeAcceso & AccionesDeCuenta & {
  usuario: Usuario | null
  rol: Rol
  accesoActivo: boolean
  cargando: boolean
  // Entró por el enlace de "olvidé mi contraseña": lo único que puede hacer es elegir una nueva.
  enRecuperacion: boolean
  // La sesión se cayó sola (venció o se revocó): las pantallas explican por qué se pide ingresar de nuevo.
  sesionVencida: boolean
  cerrarSesion: () => void
}

// El setter no forma parte del contrato de sesión: solo existe en desarrollo.
type SesionConSetter = Sesion & { cambiarRol?: (rol: Rol) => void; vencerSesion?: () => void }

const SesionContext = createContext<SesionConSetter | null>(null)

export function SesionProvider({ children }: { children: ReactNode }) {
  const [cuenta, setCuenta] = useState<Cuenta | null>(null)
  const [enRecuperacion, setEnRecuperacion] = useState(false)
  const [vencida, setVencida] = useState(false)
  const [cargando, setCargando] = useState(true)
  const vivo = useRef({ cuenta, enRecuperacion })
  vivo.current = { cuenta, enRecuperacion }

  // La sesión real se resuelve de forma asíncrona: las pantallas ya se escriben
  // contra ese estado de carga.
  useEffect(() => setCargando(false), [])

  const usuario = import.meta.env.DEV && cuenta ? { nombre: cuenta.nombre, email: cuenta.email, conGoogle: cuenta.conGoogle } : null
  // Con el enlace de recuperación la sesión queda confinada: no vale como suscriptora ni como admin.
  const rol: Rol = import.meta.env.DEV && cuenta && !enRecuperacion ? cuenta.rol : 'visitante'

  // Cada cambio de sesión (cierre, otro rol, otro usuario) invalida lo cargado: no solo al
  // perder acceso. Un pedido en vuelo hecho con la sesión anterior tampoco puede volver a
  // llenar el caché. Se mira la identidad y no solo el rol: dos personas con el mismo rol (en un
  // dispositivo compartido) no pueden compartir memoria. Con Supabase, acá va el id del usuario.
  const email = usuario?.email
  useEffect(() => {
    vaciarCache()
  }, [rol, email])

  const valor = useMemo<SesionConSetter>(() => {
    const acciones = import.meta.env.DEV
      ? crearAcciones({
          entrar: (c) => {
            setVencida(false)
            setCuenta(c)
          },
          cuentaActual: () => vivo.current.cuenta,
          recuperando: setEnRecuperacion,
          enRecuperacion: () => vivo.current.enRecuperacion,
        })
      : sinAcceso
    return {
      ...acciones,
      // Después de un cambio de suscripción, lo cargado con el acceso anterior no sirve más.
      refrescarSesion: async () => {
        await acciones.refrescarSesion()
        vaciarCache()
      },
      usuario: email ? { nombre: cuenta?.nombre ?? '', email, conGoogle: cuenta?.conGoogle ?? false } : null,
      rol,
      accesoActivo: accesoSimulado(rol),
      cargando,
      enRecuperacion,
      sesionVencida: vencida,
      cerrarSesion: () => {
        // Pendiente: con Supabase Auth, acá va `await supabase.auth.signOut()`. Lo que sigue tiene
        // que correr siempre (también en producción): soltar la sesión local no puede depender de DEV.
        if (import.meta.env.DEV) {
          fijarRolSimulado('visitante')
          entrarSuscripcion(null, null)
        }
        setCuenta(null)
        setEnRecuperacion(false)
        setVencida(false)
      },
      ...(import.meta.env.DEV && {
        vencerSesion: () => {
          fijarRolSimulado('visitante')
          entrarSuscripcion(null, null)
          setCuenta(null)
          setEnRecuperacion(false)
          setVencida(true)
        },
        cambiarRol: (nuevo: Rol) => {
          const ejemplo = cuentaDeEjemplo(nuevo)
          if (!ejemplo) fijarRolSimulado('visitante')
          setCuenta(ejemplo && abrirSesionSimulada(ejemplo))
          setEnRecuperacion(false)
        },
      }),
    }
  }, [cuenta, email, rol, enRecuperacion, vencida, cargando])

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
  return { rol: sesion.rol, cambiarRol: sesion.cambiarRol, vencerSesion: sesion.vencerSesion }
}
