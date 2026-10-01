import { AnimatePresence, motion } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { useSesion } from '../../auth/SesionContext'
import { ascender, transicionLayout, viewportUnaVez } from '../../animaciones/movimiento'
import type { EstadoMar, Tema } from '../../datos/tipos'
import Esqueleto from '../base/Esqueleto'
import TarjetaTema from './TarjetaTema'

type Props = {
  temas: Tema[] | null
  estados: EstadoMar[] | null
  // Lo último de la grilla: el círculo punteado de "se van sumando" o un aviso de vacío.
  final?: ReactNode
}

// La grilla de temas (tarjetas `TarjetaTema`), igual en el catálogo, las meditaciones y cada estado. Filtrar es instantáneo: los
// que salen se encogen, los que entran suben y el resto se reacomoda con animación de layout.
// El escalonado es solo de la primera entrada; después de un cambio no hay demora.
export default function GrillaDeVentanas({ temas, estados, final }: Props) {
  const { accesoActivo } = useSesion()
  const yaCambio = useRef(false)
  const primera = useRef<Tema[] | null>(null)
  if (temas && !primera.current) primera.current = temas
  else if (temas && temas !== primera.current) yaCambio.current = true
  const paso = (i: number) => (yaCambio.current ? 0 : i)
  const estadoDe = (t: Tema) => estados?.find((e) => e.id === t.estadoMar)

  return (
    <ul aria-busy={!temas} className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      {temas ? (
        <AnimatePresence mode="popLayout">
          {temas.map((tema, i) => (
            <motion.li
              key={tema.slug}
              layout
              custom={paso(i)}
              variants={ascender}
              initial="oculto"
              whileInView="visible"
              viewport={viewportUnaVez}
              exit="salida"
              transition={{ layout: transicionLayout }}
            >
              <TarjetaTema tema={tema} estado={estadoDe(tema)} bloqueada={!accesoActivo} />
            </motion.li>
          ))}
          {final && (
            <motion.li
              key="final"
              layout
              custom={paso(temas.length)}
              variants={ascender}
              initial="oculto"
              whileInView="visible"
              viewport={viewportUnaVez}
              exit="salida"
              className="flex items-center justify-center"
            >
              {final}
            </motion.li>
          )}
        </AnimatePresence>
      ) : (
        Array.from({ length: 3 }, (_, i) => (
          <li key={i}>
            <Esqueleto className="h-64" />
          </li>
        ))
      )}
    </ul>
  )
}
