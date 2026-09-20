import { AnimatePresence, motion } from 'motion/react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSesion } from '../../auth/SesionContext'
import { ascender, transicionLayout, viewportUnaVez } from '../../animaciones/movimiento'
import type { EstadoMar, Tema } from '../../datos/tipos'
import Burbuja from '../base/Burbuja'
import Esqueleto from '../base/Esqueleto'
import OjoDeBuey from '../ventana/OjoDeBuey'
import TituloBurbuja from './TituloBurbuja'

type Props = { temas: Tema[] | null; estados: EstadoMar[] | null; activo: EstadoMar | null }

export default function Ventanas({ temas, estados, activo }: Props) {

  const { accesoActivo } = useSesion()
  // El escalonado es solo de la primera entrada. Desde que se usa un filtro no hay demora
  // alguna: filtrar es instantáneo y la animación acompaña.
  const yaFiltro = useRef(false)
  if (activo) yaFiltro.current = true
  const paso = (i: number) => (yaFiltro.current ? 0 : i)
  const visibles = temas && activo ? temas.filter((t) => t.estadoMar === activo.id) : temas
  const vacio = visibles?.length === 0
  const nombreDe = (t: Tema) => estados?.find((e) => e.id === t.estadoMar)?.nombre

  return (
    <Burbuja id="ventanas" tono="cielo">
      <TituloBurbuja
        titulo="Las ventanas"
        texto="Cada ventana reúne un video psicoeducativo, una meditación y una ejercitación para poner en práctica. Los títulos los ve cualquiera; el contenido es para suscriptoras."
      />

      {activo && (
        <p className="-mt-3 mb-6 flex flex-wrap items-center gap-x-3 text-base text-mar-tintaSuave">
          <span>
            Mostrando: <strong className="font-bold text-mar-tinta">{activo.nombre}</strong>
          </span>
          <Link to="/#ventanas" className="inline-flex min-h-[44px] items-center hover:underline">
            Ver todas
          </Link>
        </p>
      )}

      <ul
        aria-busy={!visibles}
        className="relative grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4"
      >
        {visibles ? (
          // Filtrar es instantáneo: las burbujas que salen se encogen y se desvanecen, las que
          // entran suben, y el resto se reacomoda con animación de layout (sin parpadear).
          <AnimatePresence mode="popLayout">
            {visibles.map((tema, i) => (
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
                <OjoDeBuey tema={tema} estadoNombre={nombreDe(tema)} bloqueada={!accesoActivo} />
              </motion.li>
            ))}
            {(!activo || vacio) && (
              <motion.li
                key="sumando"
                layout
                custom={paso(visibles?.length ?? 0)}
                variants={ascender}
                initial="oculto"
                whileInView="visible"
                viewport={viewportUnaVez}
                exit="salida"
                className="flex items-center justify-center"
              >
                <span className="flex aspect-square w-full max-w-[240px] flex-col items-center justify-center gap-1.5 rounded-full border border-dashed border-mar-aguaSuave p-6 text-center">
                  <span className="font-titulo text-lg text-mar-tintaSuave">Se van sumando</span>
                  <span className="text-sm leading-relaxed text-mar-tintaSuave">
                    {vacio
                      ? activo
                        ? 'Todavía no hay ventanas en este estado.'
                        : 'Todavía no hay ventanas publicadas.'
                      : 'Nuevas ventanas se suman con el tiempo.'}
                  </span>
                </span>
              </motion.li>
            )}
          </AnimatePresence>
        ) : (
          Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="flex justify-center">
              <Esqueleto className="aspect-square w-full max-w-[240px] rounded-full" />
            </li>
          ))
        )}
      </ul>
    </Burbuja>
  )
}
