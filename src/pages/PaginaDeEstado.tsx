import { Link, useParams } from 'react-router-dom'
import Esqueleto from '../componentes/base/Esqueleto'
import { FlechaIzquierda } from '../componentes/base/iconos'
import AtajosDeEstados from '../componentes/estados/AtajosDeEstados'
import Pagina from '../componentes/layout/Pagina'
import ImagenDeVentana from '../componentes/objetos/ImagenDeVentana'
import { coloresDe } from '../componentes/objetos/estados/colores'
import SinDestino from '../componentes/soporte/SinDestino'
import GrillaDeVentanas from '../componentes/ventana/GrillaDeVentanas'
import { listarEstados, listarTemas } from '../datos/contenido'
import { cn } from '../lib/cn'
import { estadoDeUrl } from '../lib/estados'
import { useCarga } from '../lib/useCarga'

// Una página por estado del mar: qué se vive ahí, qué enseña y las ventanas que le corresponden.
export default function PaginaDeEstado() {
  const { id } = useParams()
  const { datos: estados } = useCarga('estados', listarEstados, true)
  const { datos: temas } = useCarga('temas', listarTemas, true)
  const estado = estados?.find((e) => e.id === estadoDeUrl(id)) ?? null
  const c = coloresDe(estado?.estilo ?? null)

  if (estados && !estado) {
    return <SinDestino titulo="Esa ventana no existe" texto="Puede que el enlace esté mal escrito." />
  }

  const propias = temas && estado ? temas.filter((t) => t.estadoMar === estado.id) : null
  // Si este estado todavía no tiene temas, se sugieren hasta tres de otros: mejor un camino que una página vacía.
  const sugeridos = temas && estado ? temas.filter((t) => t.estadoMar !== estado.id).slice(0, 3) : null

  return (
    <Pagina ancho="ancho">
      <Link to="/ventanas" className="inline-flex min-h-control-sm items-center gap-2 self-start pt-2 text-cuerpo font-medium text-mar-tintaSuave no-underline hover:text-mar-tinta">
        <FlechaIzquierda />
        Todos los temas
      </Link>

      <section className={cn('grid gap-6 overflow-hidden rounded-burbujaGrande border p-6 shadow-suave md:grid-cols-[minmax(0,1fr)_280px] md:items-center md:gap-10 md:p-10', c.fondo, c.borde)}>
        <div className="flex flex-col">
          {estado ? (
            <>
              <p className="mb-3 text-etiqueta uppercase text-mar-tintaSuave">Ventana</p>
              <h1 className="mb-4 text-titulo-l md:text-titulo-xl">{estado.nombre}</h1>
              <p className="mb-5 text-destacado text-mar-tintaSuave">{estado.estadoInterno}.</p>
              <p className="rounded-burbuja bg-mar-blanco/70 p-4 font-titulo text-titulo-s italic text-mar-tinta">{estado.ensenanza}.</p>
            </>
          ) : (
            <div role="status" className="flex flex-col gap-3">
              <span className="sr-only">Cargando la ventana…</span>
              <Esqueleto className="h-4 w-28 bg-mar-blanco/70" />
              <Esqueleto className="h-12 w-3/4 bg-mar-blanco/70" />
              <Esqueleto className="h-16 bg-mar-blanco/70" />
            </div>
          )}
        </div>
        <div aria-hidden="true" className={cn('relative order-first aspect-[3/1] overflow-hidden rounded-burbuja shadow-ventana md:order-last md:aspect-square', c.agua)}>
          <ImagenDeVentana estado={estado} vivo="siempre" autonomo />
        </div>
      </section>

      <section className="flex flex-col gap-6 py-4">
        <h2 className="text-center text-titulo-m md:text-titulo-l">Temas de esta ventana</h2>
        {propias?.length === 0 ? (
          <div className="flex flex-col gap-6">
            <p className="mx-auto w-full max-w-parrafo rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-5 text-center text-cuerpo text-mar-tintaSuave shadow-suave">
              Todavía no hay temas en esta ventana. Se van sumando con el tiempo.
              {sugeridos && sugeridos.length > 0 && ' Mientras tanto, estos pueden acompañarte:'}
            </p>
            {sugeridos && sugeridos.length > 0 && <GrillaDeVentanas temas={sugeridos} estados={estados} />}
          </div>
        ) : (
          <GrillaDeVentanas temas={propias} estados={estados} />
        )}
      </section>

      {estado && (
        <nav aria-label="Otras ventanas" className="flex flex-col items-center gap-3">
          <p className="text-cuerpo font-bold text-mar-tinta">Otras ventanas</p>
          <AtajosDeEstados excepto={estado.id} centrado />
        </nav>
      )}
    </Pagina>
  )
}
