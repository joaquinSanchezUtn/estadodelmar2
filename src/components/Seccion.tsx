import clsx from 'clsx'
import type { ReactNode } from 'react'

const fondos = {
  degrade: 'bg-gradient-to-b from-mar-marfil to-mar-aguaClara',
  marfil: 'bg-mar-marfil',
  agua: 'bg-mar-aguaClara',
  arena: 'bg-mar-arenaClara',
  espuma: 'bg-mar-espuma',
}

type Props = {
  fondo: keyof typeof fondos
  id?: string
  angosta?: boolean
  className?: string
  children: ReactNode
}

// Franja de ancho completo con el contenido centrado y respirado.
export default function Seccion({ fondo, id, angosta = false, className, children }: Props) {
  return (
    <section id={id} className={fondos[fondo]}>
      <div
        className={clsx(
          'mx-auto px-6 py-10 lg:px-16 lg:py-16',
          angosta ? 'max-w-3xl' : 'max-w-6xl',
          className,
        )}
      >
        {children}
      </div>
    </section>
  )
}
