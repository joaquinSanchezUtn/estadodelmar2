import { motion } from 'motion/react'
import { derivar } from '../../../animaciones/movimiento'
import { trazo } from './trazos'
import type { PropsDibujo } from './tipos'

// Corrientes: líneas de flujo (guiones que avanzan) con una flecha suave. El guion se
// desplaza exactamente un período (14 + 10), así el bucle no tiene corte.
const flujos = [
  { d: 'M0 70 C50 56 100 84 150 70 S250 58 260 70', o: 0.5, seg: 5 },
  { d: 'M0 104 C50 90 100 118 150 104 S250 92 260 104', o: 1, seg: 4 },
  { d: 'M0 138 C50 124 100 152 150 138 S250 126 260 138', o: 0.5, seg: 6 },
]

export default function Corrientes({ agua }: PropsDibujo) {
  return (
    <>
      {flujos.map((f) => (
        <g key={f.d} opacity={f.o}>
          <motion.path
            d={f.d}
            className={`${trazo} [stroke-dasharray:14_10]`}
            variants={agua(derivar(f.seg, -24), derivar(f.seg / 2, -24))}
          />
        </g>
      ))}
      <path d="M170 92 L184 104 L170 116" className={trazo} />
    </>
  )
}
