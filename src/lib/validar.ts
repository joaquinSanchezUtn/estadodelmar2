// Validaciones de formulario. Solo mejoran la experiencia: la que vale es la del servidor.
export const emailValido = (valor: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim())

export const LARGO_MINIMO_CONTRASENA = 8
export const contrasenaValida = (valor: string) => valor.length >= LARGO_MINIMO_CONTRASENA
