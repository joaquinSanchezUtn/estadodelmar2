import clsx from 'clsx'

// Bloque de carga. La animación se apaga si la persona pidió menos movimiento.
export default function Esqueleto({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={clsx('rounded-xl bg-mar-espuma motion-safe:animate-pulse', className)}
    />
  )
}
