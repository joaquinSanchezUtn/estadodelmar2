import { motion } from 'motion/react'
import { derivar, oscilar } from '../../../animaciones/movimiento'
import { irregular, trazo } from './trazos'
import type { PropsDibujo } from './tipos'

// Los dos patrones suman 200 de ancho: se repiten sin costura.
const patronA: [number, number][] = [[30, -13], [22, 9], [40, -17], [26, 8], [32, -10], [50, 14]]
const patronB: [number, number][] = [[24, 10], [36, -14], [20, 8], [44, -12], [28, 11], [48, -9]]

// Mar agitado: ondas cortas y desparejas.
export default function MarAgitado({ agua }: PropsDibujo) {
  return (
    <>
      <motion.g variants={agua(derivar(12, -200), derivar(6, -200))}>
        <path d={irregular(90, patronA)} className={trazo} />
      </motion.g>
      <motion.g variants={agua(derivar(16, -200), derivar(8, -200))}>
        <motion.path
          d={irregular(128, patronB)}
          className={`${trazo} opacity-55`}
          variants={agua(oscilar(1.5, 2.4), oscilar(2.5, 1.4))}
        />
      </motion.g>
    </>
  )
}
