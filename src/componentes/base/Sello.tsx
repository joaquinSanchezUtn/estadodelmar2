import clsx from 'clsx'
import type { ReactNode } from 'react'

// El color va en el punto; el texto queda en tinta para que se lea bien.
const puntos = {
  agua: 'bg-mar-agua',
  coral: 'bg-mar-coral',
  neutro: 'bg-mar-tintaTenue',
}

type Props = { tono: keyof typeof puntos; children: ReactNode }

// Etiqueta chica de estado: "Publicada", "Borrador", "Activa".
export default function Sello({ tono, children }: Props) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-mar-bordeCielo bg-mar-blanco px-3 py-1 text-meta text-mar-tinta">
      <span className={clsx('size-2 rounded-full', puntos[tono])} aria-hidden="true" />
      {children}
    </span>
  )
}
