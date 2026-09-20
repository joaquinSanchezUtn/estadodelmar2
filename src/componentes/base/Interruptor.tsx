import clsx from 'clsx'
import { useId } from 'react'

type Props = {
  etiqueta: string
  ayuda?: string
  activo: boolean
  onCambio: (activo: boolean) => void
}

// Interruptor accesible: un botón con role="switch" y su etiqueta asociada.
export default function Interruptor({ etiqueta, ayuda, activo, onCambio }: Props) {
  const id = useId()

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-mar-bordeAgua bg-mar-blanco p-4">
      <span id={id} className="flex flex-col gap-0.5">
        <span className="text-base font-medium text-mar-tinta">{etiqueta}</span>
        {ayuda && <span className="text-sm text-mar-tintaSuave">{ayuda}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={activo}
        aria-labelledby={id}
        onClick={() => onCambio(!activo)}
        className="flex h-11 w-16 shrink-0 items-center justify-center"
      >
        <span
          className={clsx(
            'relative h-7 w-12 rounded-full transition-colors',
            activo ? 'bg-mar-agua' : 'bg-mar-tintaSuave/30',
          )}
        >
          <span
            className={clsx(
              'absolute top-1 h-5 w-5 rounded-full bg-mar-blanco shadow transition-all',
              activo ? 'left-6' : 'left-1',
            )}
          />
        </span>
      </button>
    </div>
  )
}
