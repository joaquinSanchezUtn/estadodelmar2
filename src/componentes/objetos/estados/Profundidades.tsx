import { motion } from 'motion/react'
import { oscilar } from '../../../animaciones/movimiento'
import { trazo } from './trazos'
import type { PropsDibujo } from './tipos'

// Seis líneas horizontales que se aclaran hacia abajo: abajo reina el silencio.
const lineas = [
  { y: 52, x1: 10, x2: 190, o: 1 },
  { y: 74, x1: 18, x2: 182, o: 0.78 },
  { y: 96, x1: 28, x2: 172, o: 0.58 },
  { y: 118, x1: 40, x2: 160, o: 0.4 },
  { y: 140, x1: 54, x2: 146, o: 0.25 },
  { y: 162, x1: 70, x2: 130, o: 0.13 },
]

export default function Profundidades({ agua }: PropsDibujo) {
  return (
    <>
      {lineas.map((l, i) => (
        <g key={l.y} opacity={l.o}>
          <motion.line
            x1={l.x1}
            x2={l.x2}
            y1={l.y}
            y2={l.y}
            className={trazo}
            variants={agua(oscilar(1.2, 8 + i), oscilar(2, 5 + i * 0.6))}
          />
        </g>
      ))}
    </>
  )
}
