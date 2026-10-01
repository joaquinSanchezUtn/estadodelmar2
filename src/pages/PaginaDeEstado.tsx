import { Link, useParams } from 'react-router-dom'
import Burbuja from '../componentes/base/Burbuja'
import EstadoVacio from '../componentes/base/EstadoVacio'
import Esqueleto from '../componentes/base/Esqueleto'
import { FlechaIzquierda } from '../componentes/base/iconos'
import Pagina from '../componentes/layout/Pagina'
import DibujoEstado from '../componentes/objetos/DibujoEstado'
import { coloresDe } from '../componentes/objetos/estados/colores'
import GrillaDeVentanas from '../componentes/ventana/GrillaDeVentanas'
import { listarEstados, listarTemas } from '../datos/contenido'
import { cn } from '../lib/cn'
import { estadoDeUrl, urlDeEstado } from '../lib/estados'
import { useCarga } from '../lib/useCarga'

// Una página por estado del mar: qué se vive ahí, qué enseña y las ventanas que le corresponden.
export default function PaginaDeEstado() {
  const { id } = useParams()
  const { datos: estados } = useCarga('estados', listarEstados, true)
  const { datos: temas } = useCarga('temas', listarTemas, true)
  const estado = estados?.find((e) => e.id === estadoDeUrl(id)) ?? null
  const c = coloresDe(estado?.id ?? null)

  if (estados && !estado) {
    return (
      <Pagina ancho="lectura">
        <Burbuja tono="aguaClara" entrada="ninguna">
          <EstadoVacio titulo="Ese estado del mar no existe" texto="Puede que el enlace esté mal escrito." enlace={{ to: '/ventanas', texto: 'Ver todas las ventanas' }} />
        </Burbuja>
      </Pagina>
    )
  }

  const propias = temas && estado ? temas.filter((t) => t.estadoMar === estado.id) : null
  const otros = estados?.filter((e) => e.id !== estado?.id)

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
              <p className="mb-3 text-etiqueta uppercase text-mar-tintaSuave">Estado del mar</p>
              <h1 className="mb-4 text-titulo-l md:text-titulo-xl">{estado.nombre}</h1>
              <p className="mb-5 text-destacado text-mar-tintaSuave">{estado.estadoInterno}.</p>
              <p className="rounded-burbuja bg-mar-blanco/70 p-4 font-titulo text-titulo-s italic text-mar-tinta">{estado.ensenanza}.</p>
            </>
          ) : (
            <div role="status" className="flex flex-col gap-3">
              <span className="sr-only">Cargando el estado…</span>
              <Esqueleto className="h-4 w-28 bg-mar-blanco/70" />
              <Esqueleto className="h-12 w-3/4 bg-mar-blanco/70" />
              <Esqueleto className="h-16 bg-mar-blanco/70" />
            </div>
          )}
        </div>
        <div aria-hidden="true" className={cn('relative order-first aspect-[3/1] overflow-hidden rounded-burbuja shadow-ventana md:order-last md:aspect-square', c.agua)}>
          <DibujoEstado estado={estado?.id ?? null} vivo="siempre" autonomo />
        </div>
      </section>

      <section className="flex flex-col gap-6 py-4">
        <h2 className="text-titulo-m md:text-titulo-l">Temas de este estado</h2>
        {propias?.length === 0 ? (
          <p className="rounded-burbuja border border-dashed border-mar-bordeAgua bg-mar-blanco/60 p-5 text-cuerpo text-mar-tintaSuave">
            Todavía no hay temas en este estado. Se van sumando con el tiempo.
          </p>
        ) : (
          <GrillaDeVentanas temas={propias} estados={estados} />
        )}
      </section>

      {otros && (
        <nav aria-label="Otros estados del mar" className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-cuerpo text-mar-tintaSuave">Otros estados:</span>
          {otros.map((e) => (
            <Link key={e.id} to={urlDeEstado(e.id)} className="inline-flex min-h-control-sm items-center rounded-full border border-mar-bordeControl bg-mar-blanco px-4 text-cuerpo text-mar-tinta no-underline hover:bg-mar-primarioSuave">
              {e.nombre}
            </Link>
          ))}
        </nav>
      )}
    </Pagina>
  )
}
