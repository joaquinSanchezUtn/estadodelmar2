import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

const tonos = {
  error: 'border-mar-coral/60 bg-mar-blanco text-mar-coral',
  info: 'border-mar-bordeAgua bg-mar-espuma text-mar-tinta',
}

// Mensaje corto dentro de un formulario o pantalla. Los errores se anuncian solos (alert).
export default function Aviso({ tono = 'error', className, children }: { tono?: keyof typeof tonos; className?: string; children: ReactNode }) {
  return (
    <div role={tono === 'error' ? 'alert' : 'status'} className={cn('rounded-control border px-4 py-3 text-cuerpo', tonos[tono], className)}>
      {children}
    </div>
  )
}
