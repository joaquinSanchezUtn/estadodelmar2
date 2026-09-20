import { motion } from 'motion/react'
import { derivar, oscilar } from '../../../animaciones/movimiento'
import { quebrada, trazo } from './trazos'
import type { PropsDibujo } from './tipos'

// dx suma 200 y dy suma 0: el patrón se repite sin costura.
const picos: [number, number][] = [
  [14, -38], [12, 52], [18, -46], [10, 30], [16, -34], [14, 44], [18, -20],
  [12, 12], [14, -30], [12, 40], [20, -24], [10, 8], [12, -14], [18, 20],
]
const picosMenores: [number, number][] = [
  [20, 22], [16, -30], [22, 26], [14, -18], [24, 28], [18, -22], [26, 14], [14, -12], [22, 10], [24, -18],
]

// Tormenta: picos altos y quebrados, con la agitación más fuerte de las ocho.
export default function Tormenta({ agua }: PropsDibujo) {
  return (
    <>
      <motion.g variants={agua(derivar(8, -200), derivar(4, -200))}>
        <motion.path d={quebrada(100, picos)} className={trazo} variants={agua(oscilar(2, 1.6), oscilar(3.5, 0.9))} />
      </motion.g>
      <motion.g variants={agua(derivar(11, -200), derivar(5.5, -200))}>
        <path d={quebrada(140, picosMenores)} className={`${trazo} opacity-50`} />
      </motion.g>
    </>
  )
}
