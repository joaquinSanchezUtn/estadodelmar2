import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { RADIO_CABECERA, idVentana, transicion, transicionLayout, useMovimiento } from '../../animaciones/movimiento'
import { listarEnfoques } from '../../datos/contenido'
import type { EstadoMar, Tema } from '../../datos/tipos'
import { cn } from '../../lib/cn'
import Esqueleto from '../base/Esqueleto'
import { FlechaIzquierda } from '../base/iconos'
import ImagenDeVentana from '../objetos/ImagenDeVentana'
import { coloresDe } from '../objetos/estados/colores'

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
        className={cn('absolute inset-0 border shadow-suave', coloresDe(estado?.estilo ?? null).fondo, coloresDe(estado?.estilo ?? null).borde)}
      />
      <div className="relative grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_240px] md:items-center md:gap-10 md:p-10">
        <div aria-hidden="true" className={cn('relative order-first aspect-[3/1] overflow-hidden rounded-burbuja shadow-ventana md:order-last md:aspect-square', coloresDe(estado?.estilo ?? null).agua)}>
          <ImagenDeVentana estado={estado} vivo="siempre" autonomo />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...transicion.media, delay: 0.15 }}
          className="flex flex-col"
        >
          <Link
            to="/ventanas"
            className="mb-4 inline-flex min-h-control-sm items-center gap-2 self-start text-cuerpo font-medium text-mar-tintaSuave no-underline hover:text-mar-tinta"
          >
            <FlechaIzquierda />
            Todos los temas
          </Link>
          {tema ? (
            <>
              {(estado || tema.enfoque) && (
                <p className="mb-3 text-etiqueta uppercase text-mar-tintaSuave">
                  {[estado?.nombre, listarEnfoques().find((f) => f.id === tema.enfoque)?.nombre].filter(Boolean).join(' · ')}
                </p>
              )}
              <h1 className="mb-4 text-titulo-l md:text-titulo-xl">{tema.titulo}</h1>
              <p className="text-destacado text-mar-tintaSuave">{tema.descripcion}</p>
              {estado && (
                <blockquote className="mt-6 rounded-burbuja bg-mar-blanco/70 p-4 font-titulo text-cuerpo italic text-mar-tinta">
                  {estado.ensenanza}.
                </blockquote>
              )}
            </>
          ) : (
            <div role="status" className="flex flex-col gap-3">
              <span className="sr-only">Cargando el tema…</span>
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
