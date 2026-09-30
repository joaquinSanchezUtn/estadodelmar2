import { motion } from 'motion/react'
import { useSesion } from '../../auth/SesionContext'
import { cascada, emerger, viewportUnaVez } from '../../animaciones/movimiento'
import type { EstadoMar, Tema } from '../../datos/tipos'
import Esqueleto from '../base/Esqueleto'
import TarjetaTema from '../ventana/TarjetaTema'
import Seccion from './Seccion'

type Props = { temas: Tema[] | null; estados: EstadoMar[] | null }

const CANTIDAD = 6
const grilla = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5'

// Los primeros temas del catálogo, como tarjetas. El resto, en /ventanas.
export default function TemasInicio({ temas, estados }: Props) {
  const { accesoActivo } = useSesion()
  if (temas?.length === 0) return null

  return (
    <Seccion
      id="temas"
      titulo="Temas para empezar"
      texto="Cada tema reúne un video, una meditación y una ejercitación. Los títulos los ve cualquiera; el contenido es para suscriptoras."
      enlace={temas && temas.length > CANTIDAD ? { to: '/ventanas', texto: `Ver los ${temas.length} temas` } : { to: '/ventanas', texto: 'Buscar un tema' }}
    >
      {temas ? (
        // Se monta recién con los datos: ver "Trampas de Motion" en CLAUDE.md.
        <motion.ul variants={cascada(0.06)} initial="oculto" whileInView="visible" viewport={viewportUnaVez} className={grilla}>
          {temas.slice(0, CANTIDAD).map((t) => (
            <motion.li key={t.id} variants={emerger}>
              <TarjetaTema tema={t} estado={estados?.find((e) => e.id === t.estadoMar)} bloqueada={!accesoActivo} />
            </motion.li>
          ))}
        </motion.ul>
      ) : (
        <ul aria-busy="true" className={grilla}>
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i}>
              <Esqueleto className="h-64" />
            </li>
          ))}
        </ul>
      )}
    </Seccion>
  )
}
