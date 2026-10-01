import { motion } from 'motion/react'
import { cascada, emerger, viewportUnaVez } from '../../animaciones/movimiento'
import type { EstadoMar, Tema } from '../../datos/tipos'
import Esqueleto from '../base/Esqueleto'
import TarjetaEstado from './TarjetaEstado'
import Seccion from './Seccion'

type Props = { estados: EstadoMar[] | null; temas: Tema[] | null }

// De a dos ya en el celular: una por fila eran ocho tarjetas altas, casi tres pantallas de scroll.
const grilla = 'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5'

// La metáfora como navegación: la persona ubica su estado y de ahí llega a las ventanas.
export default function EstadosDelMar({ estados, temas }: Props) {
  return (
    <Seccion id="estados" titulo="¿Cómo está tu mar hoy?" texto="Elegí cómo te sentís y te mostramos por dónde empezar.">
      {estados ? (
        // La lista con animación se monta recién cuando llegan los datos. Si se montara antes,
        // con esqueletos, y entrara en pantalla mientras carga (monitores altos), quedaría
        // "visible" sin hijos: las tarjetas que llegan después nacen ocultas y no se revelan nunca.
        <motion.ul
          variants={cascada(0.05)}
          initial="oculto"
          whileInView="visible"
          viewport={viewportUnaVez}
          className={grilla}
        >
          {estados.map((estado) => (
            <motion.li key={estado.id} variants={emerger}>
              <TarjetaEstado estado={estado} cantidad={temas ? temas.filter((t) => t.estadoMar === estado.id).length : null} />
            </motion.li>
          ))}
        </motion.ul>
      ) : (
        <ul aria-busy="true" className={grilla}>
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i}>
              <Esqueleto className="h-52" />
            </li>
          ))}
        </ul>
      )}
    </Seccion>
  )
}
