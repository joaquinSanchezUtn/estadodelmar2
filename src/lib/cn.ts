import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// twMerge no conoce los nombres de nuestra escala: sin esto trataría `text-cuerpo` como un color
// y lo pisaría con `text-mar-tinta`. Los nombres tienen que coincidir con tailwind.config.js.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['etiqueta', 'meta', 'cuerpo', 'destacado', 'titulo-s', 'titulo-m', 'titulo-l', 'titulo-xl'],
      radius: ['control', 'tarjeta', 'burbuja', 'burbujaGrande'],
      container: ['angosto', 'lectura', 'ancho', 'parrafo', 'ojo'],
      shadow: ['burbuja', 'tarjeta', 'ojo', 'ojoFoco', 'ventana', 'elevada', 'encabezado'],
    },
  },
})

// Combina clases condicionales sin que se pisen entre sí.
export const cn = (...entradas: ClassValue[]) => twMerge(clsx(entradas))
