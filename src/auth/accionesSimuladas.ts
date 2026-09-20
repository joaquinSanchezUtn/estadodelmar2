// SESIÓN SIMULADA — se reemplaza por Supabase Auth. Implementa AccionesDeAcceso contra la "base de
// cuentas" en memoria (cuentasSimuladas.ts). Solo se usa en desarrollo: en producción todo devuelve
// 'no-disponible' y este archivo ni entra al bundle.
import {
  cambiarContrasenaDe, confirmarPendiente, crearCuenta, cuentaDeGoogle, eliminarRegistro, marcarConfirmacion,
  marcarRecuperacion, renombrar, semillaDeSuscripcion, tomarRecuperacion, verificarIngreso, type Cuenta,
} from '../datos/cuentasSimuladas'
import { fijarRolSimulado } from '../datos/sesionSimulada'
import { entrarSuscripcion, olvidarSuscripcion, rolDe, suscripcionSimulada } from '../datos/suscripcionSimulada'
import { contrasenaValida, emailValido } from '../lib/validar'
import type { AccionesDeAcceso, AccionesDeCuenta, ResultadoAuth, ResultadoRetorno } from './tipos'

const LATENCIA_MS = 450
const esperar = () => new Promise<void>((resolver) => setTimeout(resolver, LATENCIA_MS))
const ok: ResultadoAuth = { ok: true }

// Abre la sesión de una cuenta: la suscripción que tenía, el rol que le corresponde y lo que ve la "base".
export function abrirSesionSimulada(cuenta: Cuenta): Cuenta {
  entrarSuscripcion(cuenta.email, semillaDeSuscripcion(cuenta))
  const rol = rolDe(cuenta.rol, suscripcionSimulada())
  if (rol !== 'visitante') fijarRolSimulado(rol) // primero la "base", después la interfaz
  return rol === 'visitante' ? cuenta : { ...cuenta, rol }
}

type Enganche = {
  entrar: (cuenta: Cuenta) => void
  cuentaActual: () => Cuenta | null
  recuperando: (valor: boolean) => void
  enRecuperacion: () => boolean
}

export function crearAcciones({ entrar, cuentaActual, recuperando, enRecuperacion }: Enganche): AccionesDeAcceso & AccionesDeCuenta {
  const iniciar = (cuenta: Cuenta): ResultadoAuth => {
    entrar(abrirSesionSimulada(cuenta))
    return ok
  }

  return {
    async ingresar(email, contrasena) {
      await esperar()
      const r = verificarIngreso(email, contrasena)
      return 'error' in r ? { ok: false, error: r.error } : iniciar(r.cuenta)
    },

    async ingresarConGoogle() {
      await esperar()
      return ok // la sesión se completa al volver a /auth/callback
    },

    async registrar(nombre, email, contrasena) {
      await esperar()
      if (!contrasenaValida(contrasena)) return { ok: false, error: 'contrasena-debil' }
      if (nombre.trim() && emailValido(email)) crearCuenta(nombre, email, contrasena)
      return ok
    },

    async reenviarConfirmacion(email) {
      await esperar()
      marcarConfirmacion(email)
      return ok
    },

    async pedirRecuperacion(email) {
      await esperar()
      marcarRecuperacion(email)
      return ok
    },

    async completarRetorno(tipo): Promise<ResultadoRetorno> {
      await esperar()
      if (tipo === 'recuperacion') {
        const cuenta = tomarRecuperacion()
        if (!cuenta) return { ok: false, error: 'enlace-invalido' }
        // Sesión confinada: sigue siendo visitante para todo (rol y datos) hasta elegir la contraseña nueva.
        // Las dos "verdades" (la interfaz y la base) se sueltan juntas: si no, la base seguiría dando
        // el acceso de quien estaba antes.
        fijarRolSimulado('visitante')
        entrarSuscripcion(null, null)
        recuperando(true)
        entrar(cuenta)
        return { ok: true, recuperacion: true }
      }
      const cuenta = tipo === 'google' ? cuentaDeGoogle() : confirmarPendiente()
      if (!cuenta) return { ok: false, error: 'enlace-invalido' }
      iniciar(cuenta)
      return { ok: true, recuperacion: false }
    },

    async cambiarContrasena(nueva) {
      await esperar()
      const cuenta = cuentaActual()
      if (!cuenta || !enRecuperacion()) return { ok: false, error: 'enlace-invalido' }
      if (!contrasenaValida(nueva)) return { ok: false, error: 'contrasena-debil' }
      cambiarContrasenaDe(cuenta.email, nueva)
      recuperando(false)
      iniciar(cuenta) // recién ahora la sesión vale con su rol completo
      return ok
    },

    async actualizarPerfil(nombre) {
      await esperar()
      const cuenta = cuentaActual()
      if (!cuenta) return { ok: false, error: 'enlace-invalido' }
      renombrar(cuenta.email, nombre)
      entrar({ ...cuenta, nombre: nombre.trim() })
      return ok
    },

    async cambiarContrasenaActual(actual, nueva) {
      await esperar()
      const cuenta = cuentaActual()
      if (!cuenta || cuenta.conGoogle) return { ok: false, error: 'no-disponible' }
      if (!('cuenta' in verificarIngreso(cuenta.email, actual))) return { ok: false, error: 'contrasena-actual' }
      if (!contrasenaValida(nueva)) return { ok: false, error: 'contrasena-debil' }
      cambiarContrasenaDe(cuenta.email, nueva)
      return ok
    },

    async eliminarCuenta() {
      await esperar()
      const cuenta = cuentaActual()
      if (!cuenta) return { ok: false, error: 'enlace-invalido' }
      eliminarRegistro(cuenta.email)
      olvidarSuscripcion(cuenta.email)
      return ok
    },

    async refrescarSesion() {
      await esperar()
      const cuenta = cuentaActual()
      if (!cuenta) return
      const rol = rolDe(cuenta.rol, suscripcionSimulada())
      if (rol === 'visitante') return
      fijarRolSimulado(rol)
      if (rol !== cuenta.rol) entrar({ ...cuenta, rol }) // sin cambios, no se vuelve a renderizar todo
    },
  }
}

export const sinAcceso: AccionesDeAcceso & AccionesDeCuenta = {
  ingresar: async () => ({ ok: false, error: 'no-disponible' }),
  ingresarConGoogle: async () => ({ ok: false, error: 'no-disponible' }),
  registrar: async () => ({ ok: false, error: 'no-disponible' }),
  reenviarConfirmacion: async () => ({ ok: false, error: 'no-disponible' }),
  pedirRecuperacion: async () => ({ ok: false, error: 'no-disponible' }),
  completarRetorno: async () => ({ ok: false, error: 'no-disponible' }),
  cambiarContrasena: async () => ({ ok: false, error: 'no-disponible' }),
  actualizarPerfil: async () => ({ ok: false, error: 'no-disponible' }),
  cambiarContrasenaActual: async () => ({ ok: false, error: 'no-disponible' }),
  eliminarCuenta: async () => ({ ok: false, error: 'no-disponible' }),
  refrescarSesion: async () => {},
}
