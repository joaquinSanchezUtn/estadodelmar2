import { motion } from 'motion/react'
import { presionar } from '../../animaciones/movimiento'
import { cn } from '../../lib/cn'
import { Pausa, Play } from './iconos'

const medidas = { chico: 'size-12', grande: 'size-16' }

// El botón de reproducir: chico en las listas, grande sobre el video. Cambia a pausa mientras suena.
export default function BotonReproducir({
  tamano,
  etiqueta,
  onClick,
  sonando = false,
  disabled,
}: {
  tamano: keyof typeof medidas
  etiqueta: string
  onClick?: () => void
  sonando?: boolean
  disabled?: boolean
}) {
  const Icono = sonando ? Pausa : Play
  return (
    <motion.button
      type="button"
      whileTap={presionar}
      aria-label={etiqueta}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-mar-celeste text-mar-tintaBoton transition hover:brightness-95 disabled:opacity-50',
        medidas[tamano],
      )}
    >
      <Icono className={tamano === 'grande' ? 'size-6' : 'size-5'} />
    </motion.button>
  )
}
