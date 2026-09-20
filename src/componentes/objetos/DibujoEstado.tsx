import { motion } from 'motion/react'
import type { ComponentType } from 'react'
import { useMovimiento } from '../../animaciones/movimiento'
import type { EstadoMarId } from '../../datos/tipos'
import { cn } from '../../lib/cn'
import Calma from './estados/Calma'
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
  const activo = !reducido && (vivo === 'siempre' || escritorio)
  const agua: Agua = activo ? (reposo, enfocar) => ({ reposo, enfocar }) : () => ({})
  const Dibujo = dibujos[estado ?? 'calma']

  return (
    <motion.svg
      viewBox="0 0 200 200"
      preserveAspectRatio={ajuste === 'cubrir' ? 'xMidYMid slice' : 'xMidYMid meet'}
      initial={autonomo ? 'reposo' : undefined}
      animate={autonomo ? 'reposo' : undefined}
      className={cn('h-full w-full', className)}
      aria-hidden="true"
      focusable="false"
    >
      <Dibujo agua={agua} />
    </motion.svg>
  )
}
