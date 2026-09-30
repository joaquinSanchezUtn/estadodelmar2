import type { Enfoque, EnfoqueId } from '../../datos/tipos'
import { cn } from '../../lib/cn'

type Props = {
  enfoques: Enfoque[]
  activo: EnfoqueId | null
  cantidades: Partial<Record<EnfoqueId, number>>
  onElegir: (id: EnfoqueId | null) => void
}

const chip = 'inline-flex min-h-control-sm items-center gap-2 rounded-full border px-4 text-cuerpo transition-colors'

// El segundo filtro del catálogo: desde dónde se mira el tema. Mismo patrón que FiltroDeEstados.
export default function FiltroDeEnfoques({ enfoques, activo, cantidades, onElegir }: Props) {
  const variante = (marcado: boolean) =>
    marcado ? 'border-mar-celesteBorde bg-mar-celeste font-medium text-mar-tintaBoton' : 'border-mar-bordeControl bg-mar-blanco/60 text-mar-tinta hover:bg-mar-blanco'

  return (
    <div role="group" aria-label="Filtrar por enfoque" className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-cuerpo text-mar-tintaSuave">Enfoque:</span>
      <button type="button" aria-pressed={!activo} onClick={() => onElegir(null)} className={cn(chip, variante(!activo))}>
        Todos
      </button>
      {enfoques.map((f) => (
        <button key={f.id} type="button" title={f.descripcion} aria-pressed={activo === f.id} onClick={() => onElegir(activo === f.id ? null : f.id)} className={cn(chip, variante(activo === f.id))}>
          {f.nombre} <span className="text-meta">{cantidades[f.id] ?? 0}</span>
        </button>
      ))}
    </div>
  )
}
