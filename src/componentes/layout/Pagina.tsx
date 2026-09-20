import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

const anchos = { angosto: 'max-w-angosto', lectura: 'max-w-lectura', ancho: 'max-w-ancho' }

// La columna de contenido de toda página: ancho, respiro lateral y ritmo vertical salen de acá.
// El encabezado y el pie usan el mismo ancho para que sus bordes queden alineados con las burbujas.
export default function Pagina({ ancho, className, children }: { ancho: keyof typeof anchos; className?: string; children: ReactNode }) {
  return (
    <div className={cn('mx-auto flex w-full flex-col gap-6 px-4 pb-16 pt-4 md:gap-8 md:px-6 md:pb-24', anchos[ancho], className)}>
      {children}
    </div>
  )
}
