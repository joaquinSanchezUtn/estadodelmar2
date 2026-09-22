import { motion, useInView } from 'motion/react'
import { useRef, type ComponentType } from 'react'
import { useMovimiento } from '../../animaciones/movimiento'
import type { EstadoMarId } from '../../datos/tipos'
import { cn } from '../../lib/cn'
import Calma from './estados/Calma'
import { coloresDe } from './estados/colores'
import Corrientes from './estados/Corrientes'
import Horizonte from './estados/Horizonte'
import MarAgitado from './estados/MarAgitado'
import Mareas from './estados/Mareas'
import OlasSuaves from './estados/OlasSuaves'
import Profundidades from './estados/Profundidades'
import Tormenta from './estados/Tormenta'
import type { Agua, PropsDibujo } from './estados/tipos'

const dibujos: Record<EstadoMarId, ComponentType<PropsDibujo>> = {
  calma: Calma,
  olas_suaves: OlasSuaves,
  agitado: MarAgitado,
  tormenta: Tormenta,
  profundidades: Profundidades,
  mareas: Mareas,
  corrientes: Corrientes,
  horizonte: Horizonte,
}

type Props = {
  estado: EstadoMarId | null
  // 'escritorio': se mueve solo en escritorio. 'siempre': también en celular (uno o dos por pantalla).
  vivo?: 'escritorio' | 'siempre'
  // Sin padre que maneje el hover (p. ej. la cabecera), el dibujo arranca solo en reposo.
  autonomo?: boolean
  ajuste?: 'cubrir' | 'contener'
  className?: string
}

// Cada estado del mar tiene su dibujo de línea, y el dibujo dice el estado. Respira con
// una animación propia y contenida; al enfocar la pieza que lo contiene, se agita un poco más.
export default function DibujoEstado({ estado, vivo = 'escritorio', autonomo = false, ajuste = 'cubrir', className }: Props) {
  const { reducido, escritorio } = useMovimiento()
  // Solo se mueve mientras está en pantalla (o a punto de estarlo): un dibujo fuera de la vista no gasta
  // procesador. Con dieciséis en la home, eso pasaba de unas 6.500 escrituras de estilo por segundo a las de los visibles.
  const ref = useRef<SVGSVGElement>(null)
  const visible = useInView(ref, { margin: '160px' })
  const activo = !reducido && visible && (vivo === 'siempre' || escritorio)
  const agua: Agua = activo ? (reposo, enfocar) => ({ reposo, enfocar }) : () => ({})
  const Dibujo = dibujos[estado ?? 'calma']

  return (
    <motion.svg
      ref={ref}
      viewBox="0 0 200 200"
      preserveAspectRatio={ajuste === 'cubrir' ? 'xMidYMid slice' : 'xMidYMid meet'}
      initial={autonomo ? 'reposo' : undefined}
      animate={autonomo ? 'reposo' : undefined}
      className={cn('h-full w-full', coloresDe(estado).linea, className)}
      aria-hidden="true"
      focusable="false"
    >
      <Dibujo agua={agua} />
    </motion.svg>
  )
}
