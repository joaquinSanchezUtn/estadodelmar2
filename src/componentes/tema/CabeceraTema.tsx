import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { RADIO_CABECERA, RADIO_OJO_DE_BUEY, idVentana, transicion, transicionLayout, useMovimiento } from '../../animaciones/movimiento'
import type { EstadoMar, Tema } from '../../datos/tipos'
import Esqueleto from '../base/Esqueleto'
import { FlechaIzquierda } from '../base/iconos'
import DibujoEstado from '../objetos/DibujoEstado'

type Props = { slug: string; tema: Tema | null; estado: EstadoMar | null }

// La burbuja de la home que creció hasta ser esta cabecera. La cáscara (fondo, borde y sombra)
// es lo único compartido con la burbuja; el contenido va aparte y aparece después, así el
// texto nunca se estira mientras la burbuja cambia de forma. La cáscara existe desde el
// primer instante, sin esperar los datos, para que la transición arranque de inmediato.
// Título, etiqueta y descripción son públicos siempre.
export default function CabeceraTema({ slug, tema, estado }: Props) {
  const { reducido } = useMovimiento()

  return (
    <div className="relative">
      <motion.div
        layoutId={reducido ? undefined : idVentana(slug)}
        transition={{ layout: transicionLayout }}
        style={{ borderRadius: RADIO_CABECERA }}
        className="absolute inset-0 border border-mar-bordeAgua bg-mar-espuma shadow-burbuja"
      />
      <div className="relative grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_240px] md:items-center md:gap-10 md:p-10">
        <div
          className="order-first aspect-[3/1] overflow-hidden bg-mar-aguaClara md:order-last md:aspect-square"
          style={{ borderRadius: RADIO_OJO_DE_BUEY }}
        >
          <DibujoEstado estado={tema?.estadoMar ?? null} vivo="siempre" autonomo className="text-mar-agua" />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...transicion.media, delay: 0.15 }}
          className="flex flex-col"
        >
          <Link
            to="/#ventanas"
            className="mb-4 inline-flex min-h-[44px] items-center gap-2 self-start text-[15px] text-mar-tintaSuave no-underline hover:text-mar-tinta"
          >
            <FlechaIzquierda />
            Todas las ventanas
          </Link>
          {tema ? (
            <>
              {estado && (
                <p className="mb-3 text-xs uppercase tracking-[0.18em] text-mar-agua">{estado.nombre}</p>
              )}
              <h1 className="mb-3.5 text-4xl font-light leading-[1.15] md:text-5xl">{tema.titulo}</h1>
              <p className="text-[17px] leading-relaxed text-mar-tintaSuave">{tema.descripcion}</p>
              {estado && (
                <blockquote className="mt-6 rounded-r-[10px] border-l-[3px] border-mar-aguaSuave bg-mar-blanco/60 px-4 py-3.5 text-base leading-relaxed text-mar-tinta">
                  {estado.ensenanza}.
                </blockquote>
              )}
            </>
          ) : (
            <div role="status" className="flex flex-col gap-3">
              <span className="sr-only">Cargando la ventana…</span>
              <Esqueleto className="h-4 w-28 bg-mar-blanco/70" />
              <Esqueleto className="h-12 w-3/4 bg-mar-blanco/70" />
              <Esqueleto className="h-16 bg-mar-blanco/70" />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
