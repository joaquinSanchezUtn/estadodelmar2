import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { encender, gestos, presionar } from '../../animaciones/movimiento'
import { cn } from '../../lib/cn'

const tonos = {
  agua: 'border-mar-bordeAgua bg-mar-blanco',
  cielo: 'border-mar-bordeCielo bg-mar-blanco',
  niebla: 'border-mar-bordeAgua bg-mar-nube',
}

const AnclaMovil = motion.create(Link)

type Props = {
  tono?: keyof typeof tonos
  // Con `to` es un enlace de verdad (<a href>): se eleva al enfocar y se presiona al tocar.
  to?: string
  className?: string
  children: ReactNode
}

// Burbuja chica. Clickeable es siempre un <a>, nunca un div con onClick.
export default function Tarjeta({ tono = 'agua', to, className, children }: Props) {
  const clases = cn('relative block rounded-burbuja border p-5 text-mar-tinta no-underline', tonos[tono], className)

  if (!to) return <div className={clases}>{children}</div>

  return (
    <AnclaMovil
      to={to}
      variants={gestos}
      initial="reposo"
      animate="reposo"
      whileHover="enfocar"
      whileFocus="enfocar"
      whileTap={presionar}
      className={clases}
    >
      {/* Sombra más abierta al enfocar: una capa que solo cambia de opacidad. */}
      <motion.span
        aria-hidden="true"
        variants={encender}
        className="pointer-events-none absolute inset-0 rounded-burbuja shadow-elevada"
      />
      {children}
    </AnclaMovil>
  )
}
