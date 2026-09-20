import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { emerger, viewportUnaVez } from '../../animaciones/movimiento'
import { cn } from '../../lib/cn'

const tonos = {
  nube: 'bg-mar-nube border-mar-bordeCielo',
  cielo: 'bg-mar-cielo border-mar-bordeCielo',
  aguaClara: 'bg-mar-aguaClara border-mar-bordeAgua',
  espuma: 'bg-mar-espuma border-mar-bordeAgua',
  blanco: 'bg-mar-blanco border-mar-bordeAgua',
}

type Props = {
  tono: keyof typeof tonos
  // Objeto decorativo de fondo (Olas, Manchas, Burbujitas). Queda detrás, recortado por la burbuja.
  decoracion?: ReactNode
  // 'scroll': emerge al entrar en pantalla. 'ninguna': visible ya, sin entrada (primera pantalla).
  entrada?: 'scroll' | 'ninguna'
  id?: string
  className?: string
  // Clases del contenedor interior (para acomodar el contenido con flex o grid).
  interior?: string
  children: ReactNode
}

// El componente que define el sitio: una sección que vive dentro de una burbuja, con esquinas
// muy redondeadas, borde apenas visible y una sombra difusa que la despega del fondo.
export default function Burbuja({ tono, decoracion, entrada = 'scroll', id, className, interior, children }: Props) {
  const sinEntrada = entrada === 'ninguna'

  return (
    <motion.section
      id={id}
      variants={emerger}
      initial={sinEntrada ? false : 'oculto'}
      whileInView={sinEntrada ? undefined : 'visible'}
      viewport={viewportUnaVez}
      className={cn(
        'relative overflow-hidden rounded-burbuja border p-6 shadow-burbuja md:rounded-burbujaGrande md:p-10',
        tonos[tono],
        className,
      )}
    >
      {decoracion}
      <div className={cn('relative', interior)}>{children}</div>
    </motion.section>
  )
}
