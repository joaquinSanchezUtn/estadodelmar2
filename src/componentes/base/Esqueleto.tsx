import { cn } from '../../lib/cn'

// Bloque de carga. La animación se apaga si la persona pidió menos movimiento.
export default function Esqueleto({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('rounded-xl bg-mar-espuma motion-safe:animate-pulse', className)}
    />
  )
}
