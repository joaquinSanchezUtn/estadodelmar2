import clsx from 'clsx'
import type { Estado } from '../../data/estados'

type Props = { estado: Estado; activo: boolean; onElegir: () => void }

export default function TarjetaEstado({ estado, activo, onElegir }: Props) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onElegir}
      className={clsx(
        'flex h-full min-h-[92px] w-full flex-col gap-1.5 rounded-xl border p-4 text-left transition lg:gap-2 lg:p-5',
        activo
          ? 'border-mar-agua bg-mar-espuma'
          : 'border-mar-bordeAgua bg-mar-blanco hover:border-mar-aguaSuave',
      )}
    >
      <span className="font-titulo text-[17px] text-mar-tinta lg:text-xl">{estado.nombre}</span>
      <span className="text-sm leading-relaxed text-mar-tintaSuave">{estado.resumen}</span>
    </button>
  )
}
