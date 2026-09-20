import { motion } from 'motion/react'
import { oscilar } from '../../../animaciones/movimiento'
import { trazo } from './trazos'
import type { PropsDibujo } from './tipos'

// El horizonte: una línea recta con un círculo bajo apoyado encima.
export default function Horizonte({ agua }: PropsDibujo) {
  return (
    <>
      <line x1="0" x2="200" y1="122" y2="122" className={trazo} />
      <line x1="60" x2="140" y1="138" y2="138" className={`${trazo} opacity-40`} />
      <line x1="80" x2="120" y1="152" y2="152" className={`${trazo} opacity-20`} />
      <motion.circle
        cx="100"
        cy="96"
        r="26"
        className={trazo}
        variants={agua(oscilar(2, 9), { y: [-6, -2], transition: { duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' } })}
      />
    </>
  )
}
