import type { ErrorAuth } from './tipos'

// Los textos de cada error de acceso. Voseo, sin dramatismo, y sin revelar de más.
export const mensajeDeError: Record<ErrorAuth, string> = {
  credenciales: 'El email o la contraseña no coinciden. Revisalos e intentá de nuevo.',
  'sin-confirmar': 'Todavía no confirmaste tu email. Revisá tu correo o pedí uno nuevo.',
  'contrasena-debil': 'La contraseña necesita al menos 8 caracteres.',
  'contrasena-actual': 'La contraseña actual no es correcta.',
  'enlace-invalido': 'Este enlace venció o ya se usó. Podés pedir uno nuevo.',
  'no-disponible': 'El acceso todavía no está disponible. Volvé a intentarlo más adelante.',
  red: 'No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.',
}
