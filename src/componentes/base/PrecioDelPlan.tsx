import type { Plan } from '../../lib/usePrecio'
import { cn } from '../../lib/cn'

type Props = { plan: Plan; tamano?: 'grande' | 'medio'; className?: string }

// El precio del plan como se muestra en el sitio. Sin descuento: el precio y «por mes». Con descuento del primer
// mes (0022): una pastilla con el porcentaje, el precio normal tachado, el del primer mes grande y, abajo, cuánto
// se paga después, para que nadie se sorprenda en el segundo cobro.
export default function PrecioDelPlan({ plan, tamano = 'grande', className }: Props) {
  const grande = tamano === 'grande'
  const cifra = cn('font-titulo', grande ? 'text-titulo-xl' : 'text-titulo-l')

  if (!plan.descuento) {
    return (
      <div className={cn('flex flex-col items-center gap-1', className)}>
        <p className={cifra}>{plan.precio}</p>
        <p className="text-meta text-mar-tintaSuave">por mes</p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <p className="rounded-full bg-mar-primario px-4 py-1 text-meta font-bold text-mar-sobrePrimario">−{plan.descuento.pct} % el primer mes</p>
      <p className="flex flex-wrap items-baseline justify-center gap-3">
        <span className={cn('text-mar-tintaSuave line-through decoration-2', grande ? 'text-titulo-m' : 'text-titulo-s')}>
          <span className="sr-only">Antes </span>
          {plan.precio}
        </span>
        <span className={cn(cifra, 'text-mar-primario')}>
          <span className="sr-only">Ahora </span>
          {plan.descuento.primerMes}
        </span>
      </p>
      <p className="text-meta text-mar-tintaSuave">
        el primer mes · después, {plan.precio} por mes
      </p>
    </div>
  )
}
