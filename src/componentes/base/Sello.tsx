import clsx from 'clsx'
import type { ReactNode } from 'react'

// El color va en el punto; el texto queda en tinta para que se lea bien.
const puntos = {
  agua: 'bg-mar-agua',
  coral: 'bg-mar-coral',
}

type Props = { tono: keyof typeof puntos; children: ReactNode }

// Etiqueta chica de estado: "Publicada", "Borrador", "Activa".
export default function Sello({ tono, children }: Props) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-mar-bordeCielo bg-mar-blanco px-2.5 py-0.5 text-xs text-mar-tinta">
      <span className={clsx('h-1.5 w-1.5 rounded-full', puntos[tono])} aria-hidden="true" />
      {children}
    </span>
  )
}
