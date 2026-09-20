import { motion } from 'motion/react'
import { derivar } from '../../../animaciones/movimiento'
import { onda, trazo } from './trazos'
import type { PropsDibujo } from './tipos'

// Olas suaves: una onda baja y regular que avanza despacio.
export default function OlasSuaves({ agua }: PropsDibujo) {
  return (
    <>
      <motion.path d={onda(92, 10, 100)} className={trazo} variants={agua(derivar(20, -100), derivar(10, -100))} />
      <motion.path
        d={onda(126, 8, 100)}
        className={`${trazo} opacity-50`}
        variants={agua(derivar(28, -100), derivar(14, -100))}
      />
    </>
  )
}
