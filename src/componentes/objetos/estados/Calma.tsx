import { motion } from 'motion/react'
import { oscilar } from '../../../animaciones/movimiento'
import { onda, trazo } from './trazos'
import type { PropsDibujo } from './tipos'

// Mar en calma: una línea horizontal casi recta. Apenas respira.
export default function Calma({ agua }: PropsDibujo) {
  return (
    <>
      <motion.path d={onda(104, 2.5, 100)} className={trazo} variants={agua(oscilar(1.5, 9), oscilar(3, 5))} />
      <motion.path
        d={onda(134, 1.5, 100)}
        className={`${trazo} opacity-40`}
        variants={agua(oscilar(1, 11, 2), oscilar(2, 6))}
      />
    </>
  )
}
