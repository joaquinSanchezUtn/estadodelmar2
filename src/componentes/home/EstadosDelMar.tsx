import { motion } from 'motion/react'
import { cascada, emerger, viewportUnaVez } from '../../animaciones/movimiento'
import type { EstadoMar, EstadoMarId } from '../../datos/tipos'
import Burbuja from '../base/Burbuja'
import Esqueleto from '../base/Esqueleto'
import TarjetaEstado from './TarjetaEstado'
import TituloBurbuja from './TituloBurbuja'

type Props = { estados: EstadoMar[] | null; activo: EstadoMarId | null }

// La metáfora como navegación: la persona ubica su estado y de ahí llega a las ventanas.
export default function EstadosDelMar({ estados, activo }: Props) {
  return (
    <Burbuja tono="blanco">
      <TituloBurbuja
        titulo="¿Cómo está tu mar hoy?"
        texto="Empezá por donde estás. Cada estado abre las ventanas que le corresponden."
      />
      <motion.ul
        variants={cascada(0.05)}
        initial="oculto"
        whileInView="visible"
        viewport={viewportUnaVez}
        aria-busy={!estados}
        className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-5"
      >
        {estados
          ? estados.map((estado) => (
              <motion.li key={estado.id} variants={emerger}>
                <TarjetaEstado estado={estado} activo={activo === estado.id} />
              </motion.li>
            ))
          : Array.from({ length: 8 }, (_, i) => (
              <li key={i}>
                <Esqueleto className="h-52" />
              </li>
            ))}
      </motion.ul>
    </Burbuja>
  )
}
