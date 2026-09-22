import type { EstadoMar, EstadoMarId } from '../../datos/tipos'
import { cn } from '../../lib/cn'

type Props = {
  estados: EstadoMar[]
  activo: EstadoMarId | null
  cantidades: Partial<Record<EstadoMarId, number>>
  onElegir: (id: EstadoMarId | null) => void
}

const chip = 'inline-flex min-h-control-sm items-center gap-2 rounded-full border px-4 text-cuerpo transition-colors'

// «Todas» y un botón por estado del mar. Es un conjunto de botones con aria-pressed: filtra en el lugar.
export default function FiltroDeEstados({ estados, activo, cantidades, onElegir }: Props) {
  const total = Object.values(cantidades).reduce((a, b) => a + (b ?? 0), 0)
  const variante = (marcado: boolean) =>
    marcado ? 'border-mar-celesteBorde bg-mar-celeste font-medium text-mar-tintaBoton' : 'border-mar-bordeControl bg-mar-blanco/60 text-mar-tinta hover:bg-mar-blanco'

  return (
    <div role="group" aria-label="Filtrar por estado del mar" className="flex flex-wrap gap-2">
      <button type="button" aria-pressed={!activo} onClick={() => onElegir(null)} className={cn(chip, variante(!activo))}>
        Todas <span className="text-meta">{total}</span>
      </button>
      {estados.map((e) => (
        <button key={e.id} type="button" aria-pressed={activo === e.id} onClick={() => onElegir(activo === e.id ? null : e.id)} className={cn(chip, variante(activo === e.id))}>
          {e.nombre} <span className="text-meta">{cantidades[e.id] ?? 0}</span>
        </button>
      ))}
    </div>
  )
}
