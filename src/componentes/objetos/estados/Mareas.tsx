import { motion } from 'motion/react'
import { derivar } from '../../../animaciones/movimiento'
import { onda, trazo } from './trazos'
import type { PropsDibujo } from './tipos'

// Mareas: dos curvas iguales, desfasadas media onda, que van y vienen en sentidos opuestos.
export default function Mareas({ agua }: PropsDibujo) {
  return (
    <>
      <motion.g variants={agua(derivar(22, -100), derivar(11, -100))}>
        <path d={onda(100, 14, 100)} className={trazo} />
      </motion.g>
      <motion.g variants={agua({ x: [-100, 0], transition: { duration: 22, repeat: Infinity, ease: 'linear' } }, { x: [-100, 0], transition: { duration: 11, repeat: Infinity, ease: 'linear' } })}>
        <g transform="translate(50 0)">
          <path d={onda(100, 14, 100)} className={`${trazo} opacity-55`} />
        </g>
      </motion.g>
    </>
  )
}
