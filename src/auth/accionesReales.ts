// Implementa AccionesDeAcceso y AccionesDeCuenta contra Supabase Auth de verdad. La sesión en sí
// (usuario, rol, enRecuperacion) no se toca acá: SesionContext la arma escuchando
// supabase.auth.onAuthStateChange, que se dispara solo cada vez que una de estas acciones cambia
// la sesión. Por eso casi ninguna función de acá actualiza estado a mano.
import type { AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { AccionesDeAcceso, AccionesDeCuenta, ErrorAuth, ResultadoAuth, ResultadoRetorno, TipoRetorno } from './tipos'

const ok: ResultadoAuth = { ok: true }
const vuelta = (tipo: TipoRetorno) => `${location.origin}/auth/callback?tipo=${tipo}`

// Nunca se expone el motivo exacto que da el servidor: solo estos pocos casos, que ya tienen su
// texto en mensajes.ts. Cualquier otro error (límite de envíos, caído el servicio) cae en 'red'.
function mapearError(error: AuthError | null): ErrorAuth {
  if (error?.code === 'email_not_confirmed') return 'sin-confirmar'
  if (error?.code === 'invalid_credentials') return 'credenciales'
  if (error?.code === 'weak_password') return 'contrasena-debil'
  return 'red'
}

// Lo único que necesita la sesión de afuera: cómo refrescar el perfil local después de escribir en
// `profiles` (esa escritura no dispara ningún evento de auth, a diferencia de auth.updateUser()).
type Enganche = { refrescarPerfil: () => Promise<void> }

export function crearAccionesReales({ refrescarPerfil }: Enganche): AccionesDeAcceso & AccionesDeCuenta {
  return {
    async ingresar(email, contrasena) {
      const { error } = await supabase.auth.signInWithPassword({ email, password: contrasena })
      return error ? { ok: false, error: mapearError(error) } : ok
    },

    // Diferido: falta crear las credenciales en Google Cloud y cargarlas en Supabase. El botón ya
    // avisa que todavía no está disponible; ni siquiera intenta la llamada.
    async ingresarConGoogle() {
      return { ok: false, error: 'no-disponible' }
    },

    async registrar(nombre, email, contrasena) {
      // Con "Confirm email" activo, registrar un email que ya existe no da error (ni dice si estaba
      // confirmado o no): es la propia protección de Supabase contra enumerar cuentas.
      const { error } = await supabase.auth.signUp({
        email,
        password: contrasena,
        options: { emailRedirectTo: vuelta('confirmacion'), data: { nombre, acepta_terminos: 'true' } },
      })
      return error ? { ok: false, error: mapearError(error) } : ok
    },

    async reenviarConfirmacion(email) {
      const { error } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: vuelta('confirmacion') } })
      return error ? { ok: false, error: mapearError(error) } : ok
    },

    async pedirRecuperacion(email) {
      // Supabase tampoco revela acá si el email tiene cuenta: siempre responde ok.
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: vuelta('recuperacion') })
      return error ? { ok: false, error: mapearError(error) } : ok
    },

    async completarRetorno(tipo): Promise<ResultadoRetorno> {
      const params = new URLSearchParams(location.search)
      if (params.get('error')) return { ok: false, error: 'enlace-invalido' }
      // getSession() espera a que el cliente termine de leer el `?code=` de la URL y arme la sesión
      // (o falle) antes de devolver algo: no hay que hacer el intercambio a mano.
      const { data, error } = await supabase.auth.getSession()
      window.history.replaceState({}, '', window.location.pathname) // el código no queda en el historial
      if (error || !data.session) return { ok: false, error: 'enlace-invalido' }
      // `recuperacion` es solo para saber a qué pantalla ir: el acceso real de esa pantalla lo decide
      // el evento PASSWORD_RECOVERY que ya escuchó SesionContext, no este parámetro de la URL.
      return { ok: true, recuperacion: tipo === 'recuperacion' }
    },

    async cambiarContrasena(nueva) {
      const { error } = await supabase.auth.updateUser({ password: nueva })
      return error ? { ok: false, error: mapearError(error) } : ok
    },

    async actualizarPerfil(nombre) {
      const { data } = await supabase.auth.getUser()
      if (!data.user) return { ok: false, error: 'enlace-invalido' }
      const { error } = await supabase.from('profiles').update({ nombre }).eq('id', data.user.id)
      if (error) return { ok: false, error: 'red' }
      await refrescarPerfil()
      return ok
    },

    async cambiarContrasenaActual(actual, nueva) {
      const { data } = await supabase.auth.getUser()
      if (!data.user?.email) return { ok: false, error: 'enlace-invalido' }
      // Reautentica con la contraseña actual antes de cambiarla: sin esto, cualquiera con la sesión
      // abierta (no necesariamente la dueña de la cuenta) podría cambiarla sin saberla.
      const { error: malaActual } = await supabase.auth.signInWithPassword({ email: data.user.email, password: actual })
      if (malaActual) return { ok: false, error: 'contrasena-actual' }
      const { error } = await supabase.auth.updateUser({ password: nueva })
      return error ? { ok: false, error: mapearError(error) } : ok
    },

    // Pendiente: necesita una Edge Function con service_role que, en este orden, cancele la
    // suscripción en Mercado Pago, revoque todas las sesiones y recién ahí borre la cuenta (ver
    // CLAUDE.md, "Para respaldar en Supabase"). El cliente no puede hacer nada de eso por su cuenta.
    async eliminarCuenta() {
      return { ok: false, error: 'no-disponible' }
    },

    async refrescarSesion() {
      await refrescarPerfil()
    },
  }
}
