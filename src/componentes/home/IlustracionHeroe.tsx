import { motion } from 'motion/react'
import { flotar, useMovimiento } from '../../animaciones/movimiento'
import { URL_LOGO } from '../../lib/activos'

// La imagen del héroe: el emblema del sitio (la ola con el brote), grande y solo, sin caja alrededor:
// el WebP ya trae la transparencia, así que se apoya directo sobre el fondo crema. Flota apenas
// (nada con movimiento reducido). Decorativa: el título de al lado ya dice qué es el sitio.
export default function IlustracionHeroe() {
  const { bucles } = useMovimiento()

  return (
    <div className="flex justify-center">
      <motion.img
        src={URL_LOGO}
        alt=""
        width={480}
        height={480}
        className="aspect-square w-4/5 object-contain"
        animate={bucles ? flotar() : undefined}
      />
    </div>
  )
}
