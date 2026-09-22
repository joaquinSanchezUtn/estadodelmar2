// La sesión real, contra Supabase Auth. `usuario`/`rol`/`accesoActivo` es lo que el front usa para
// mostrar u ocultar cosas; el acceso real a cada dato lo decide la base con RLS (ver tiene_acceso()
// en la migración 0002). Un solo listener (supabase.auth.onAuthStateChange) es la única fuente de
// verdad: ninguna acción de accionesReales.ts actualiza este estado a mano, porque cada una de ellas
// ya cambia la sesión de Supabase, y eso solo dispara el evento correspondiente.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { olvidarArchivos } from '../datos/admin'
import { vaciarCache } from '../lib/useCarga'
import type { Rol, Usuario } from '../datos/tipos'
import { crearAccionesReales } from './accionesReales'
import type { AccionesDeAcceso, AccionesDeCuenta } from './tipos'

export type Sesion = AccionesDeAcceso & AccionesDeCuenta & {
  usuario: Usuario | null
  rol: Rol
  accesoActivo: boolean
  cargando: boolean
  // Entró por el enlace de "olvidé mi contraseña": lo único que puede hacer es elegir una nueva.
  enRecuperacion: boolean
  // La sesión se cayó sola (venció o se revocó en otro lado): las pantallas explican por qué se
  // pide ingresar de nuevo, en lugar de un cierre de sesión silencioso.
  sesionVencida: boolean
  cerrarSesion: () => void
}

const SesionContext = createContext<Sesion | null>(null)

// Equivale a tiene_acceso() en la base, pero visto desde el front: solo decide qué mostrar, nunca
// qué se entrega. La fecha se compara acá también porque Mercado Pago no avisa cuando termina el
// período de una cancelada (ver CLAUDE.md).
const hoyISO = () => new Date().toISOString().slice(0, 10)

async function leerPerfil(session: Session): Promise<{ usuario: Usuario; rolReal: Rol }> {
  const [{ data: perfil }, { data: suscripciones }] = await Promise.all([
    supabase.from('profiles').select('role, nombre').eq('id', session.user.id).single(),
    supabase
      .from('suscripciones')
      .select('estado, acceso_hasta')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1),
  ])
  const usuario: Usuario = {
    nombre: perfil?.nombre ?? '',
    email: session.user.email ?? '',
    conGoogle: session.user.app_metadata?.provider === 'google',
  }
  const fila = suscripciones?.[0]
  const conAcceso = fila?.estado === 'activa' || (fila && ['cancelada', 'en_gracia'].includes(fila.estado) && (fila.acceso_hasta ?? '') >= hoyISO())
  const rolReal: Rol = perfil?.role === 'admin' ? 'admin' : conAcceso ? 'suscriptora' : 'registrada'
  return { usuario, rolReal }
}

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [rolReal, setRolReal] = useState<Rol>('visitante')
  const [enRecuperacion, setEnRecuperacion] = useState(false)
  const [vencida, setVencida] = useState(false)
  const [cargando, setCargando] = useState(true)
  const cerrandoAProposito = useRef(false)

  // Mientras dura la recuperación, la sesión queda confinada: no vale como suscriptora ni como admin,
  // aunque la cuenta lo sea (defensa en el cliente; falta el respaldo del lado del servidor, anotado
  // en CLAUDE.md). El resto de la app usa este `rol`, nunca `rolReal` directo.
  const rol: Rol = enRecuperacion ? 'visitante' : rolReal

  const cargarSesion = useCallback(async (session: Session | null) => {
    if (!session) {
      setUsuario(null)
      setRolReal('visitante')
      setCargando(false)
      return
    }
    const { usuario, rolReal } = await leerPerfil(session)
    setUsuario(usuario)
    setRolReal(rolReal)
    setVencida(false)
    setCargando(false)
  }, [])

  useEffect(() => {
    const { data: suscripcion } = supabase.auth.onAuthStateChange((evento, session) => {
      if (evento === 'SIGNED_OUT') {
        setUsuario(null)
        setRolReal('visitante')
        setEnRecuperacion(false)
        setVencida(!cerrandoAProposito.current) // false si lo pidió la propia persona
        cerrandoAProposito.current = false
        setCargando(false)
        return
      }
      if (evento === 'PASSWORD_RECOVERY') setEnRecuperacion(true)
      // USER_UPDATED es el único evento de auth.updateUser(): tanto cambiar la contraseña durante la
      // recuperación como cambiarla ya con sesión normal pasan por acá. En el primer caso, termina la
      // confinación; en el segundo, no había ninguna que terminar.
      if (evento === 'USER_UPDATED') setEnRecuperacion(false)
      if (evento === 'SIGNED_IN') setEnRecuperacion(false) // un ingreso normal nunca es una recuperación
      void cargarSesion(session)
    })
    return () => suscripcion.subscription.unsubscribe()
  }, [cargarSesion])

  // Va con el rol YA confinado (ver arriba): es "lo que se muestra", no "lo que dice la base". El
  // catálogo (contenido.ts) pregunta el acceso real a la base en cada pedido; esto solo vacía lo que
  // ya está en pantalla para que ese pedido nuevo no se quede mostrando lo de la sesión anterior.
  // `olvidarArchivos()` es lo mismo pero para el Map de archivos simulados del panel (ver admin.ts):
  // es estado privilegiado (de mentira, pero privilegiado) y no debe sobrevivir a un cambio de sesión.
  useEffect(() => {
    vaciarCache()
    olvidarArchivos()
  }, [rol, usuario?.email])

  const valor = useMemo<Sesion>(() => {
    const acciones = crearAccionesReales({ refrescarPerfil: async () => cargarSesion((await supabase.auth.getSession()).data.session) })
    return {
      ...acciones,
      // Lo que cambió puede no mover ni el rol ni el email (por ejemplo, la suscripción simulada que
      // usa Mi cuenta en desarrollo): se vacía el caché siempre, no solo cuando esas claves cambian.
      refrescarSesion: async () => {
        await acciones.refrescarSesion()
        vaciarCache()
      },
      usuario,
      rol,
      accesoActivo: rol === 'suscriptora' || rol === 'admin',
      cargando,
      enRecuperacion,
      sesionVencida: vencida,
      cerrarSesion: () => {
        cerrandoAProposito.current = true
        void supabase.auth.signOut()
      },
    }
  }, [usuario, rol, cargando, enRecuperacion, vencida, cargarSesion])

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
}

export function useSesion(): Sesion {
  const sesion = useContext(SesionContext)
  if (!sesion) throw new Error('useSesion debe usarse dentro de SesionProvider')
  return sesion
}
