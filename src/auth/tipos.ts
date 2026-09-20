// El contrato de las acciones de acceso. Es lo que las pantallas conocen: cuando entre Supabase Auth,
// cambia la implementación en SesionContext y las pantallas no se enteran.

export type ErrorAuth =
  | 'credenciales' // email o contraseña incorrectos (no se dice cuál, para no revelar qué cuentas existen)
  | 'sin-confirmar' // la cuenta existe pero falta confirmar el email
  | 'contrasena-debil'
  | 'contrasena-actual' // la contraseña actual no es la correcta
  | 'enlace-invalido' // el enlace del correo venció o ya se usó
  | 'no-disponible' // todavía no hay backend conectado
  | 'red'

export type ResultadoAuth = { ok: true } | { ok: false; error: ErrorAuth }

// Al volver de un enlace, quien lo completó dice si fue una recuperación de contraseña. Ese dato
// NUNCA sale de la URL: con Supabase es el evento PASSWORD_RECOVERY de onAuthStateChange.
export type ResultadoRetorno = { ok: true; recuperacion: boolean } | { ok: false; error: ErrorAuth }

// De dónde vuelve la persona a /auth/callback: Google, el enlace de confirmación o el de recuperación.
export type TipoRetorno = 'google' | 'confirmacion' | 'recuperacion'

export type AccionesDeCuenta = {
  actualizarPerfil: (nombre: string) => Promise<ResultadoAuth>
  cambiarContrasenaActual: (actual: string, nueva: string) => Promise<ResultadoAuth>
  // Borra la cuenta y sus datos en el servidor. El cierre de la sesión local lo hace la pantalla
  // de despedida (/cuenta-eliminada), no esta acción.
  eliminarCuenta: () => Promise<ResultadoAuth>
  // Vuelve a leer el perfil y el acceso: cambian cuando el webhook de pago actualiza la suscripción.
  refrescarSesion: () => Promise<void>
}

export type AccionesDeAcceso = {
  ingresar: (email: string, contrasena: string) => Promise<ResultadoAuth>
  // Con Supabase esto redirige a Google y la promesa nunca vuelve; en desarrollo resuelve.
  ingresarConGoogle: () => Promise<ResultadoAuth>
  registrar: (nombre: string, email: string, contrasena: string) => Promise<ResultadoAuth>
  reenviarConfirmacion: (email: string) => Promise<ResultadoAuth>
  // Siempre responde ok: no se revela si el email tiene cuenta.
  pedirRecuperacion: (email: string) => Promise<ResultadoAuth>
  completarRetorno: (tipo: TipoRetorno) => Promise<ResultadoRetorno>
  cambiarContrasena: (nueva: string) => Promise<ResultadoAuth>
}
