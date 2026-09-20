import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Combina clases condicionales sin que se pisen entre sí.
export const cn = (...entradas: ClassValue[]) => twMerge(clsx(entradas))
