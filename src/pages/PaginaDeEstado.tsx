import { Link, useParams } from 'react-router-dom'
import Burbuja from '../componentes/base/Burbuja'
import EstadoVacio from '../componentes/base/EstadoVacio'
import Esqueleto from '../componentes/base/Esqueleto'
import { FlechaIzquierda } from '../componentes/base/iconos'
import Pagina from '../componentes/layout/Pagina'
import DibujoEstado from '../componentes/objetos/DibujoEstado'
import { coloresDe } from '../componentes/objetos/estados/colores'
import GrillaDeVentanas from '../componentes/ventana/GrillaDeVentanas'
import ReflejoVidrio from '../componentes/ventana/ReflejoVidrio'
import { RADIO_OJO_DE_BUEY } from '../animaciones/movimiento'
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
      <Burbuja tono="blanco" entrada="ninguna">
        <Link to="/ventanas" className="mb-6 inline-flex min-h-control-sm items-center gap-2 text-cuerpo text-mar-tintaSuave no-underline hover:text-mar-tinta">
          <FlechaIzquierda />
          Todas las ventanas
        </Link>

        <div className={cn('grid gap-6 rounded-tarjeta border p-6 md:grid-cols-[minmax(0,1fr)_200px] md:items-center md:gap-10 md:p-10', c.fondo, c.borde)}>
          <div className="flex flex-col">
            {estado ? (
              <>
                <p className="mb-3 text-etiqueta uppercase text-mar-tintaSuave">Estado del mar</p>
                <h1 className="mb-3 text-titulo-l font-light md:text-titulo-xl">{estado.nombre}</h1>
                <p className="mb-5 text-destacado text-mar-tintaSuave">{estado.estadoInterno}.</p>
                <p className="border-l-3 border-mar-aguaSuave pl-4 font-titulo text-titulo-s italic text-mar-tinta">{estado.ensenanza}.</p>
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
          <div
            className={cn('relative order-first aspect-[3/1] overflow-hidden border-3 shadow-ventana ring-1 md:order-last md:aspect-square', c.agua, c.aro, c.aroExterior)}
            style={{ borderRadius: RADIO_OJO_DE_BUEY }}
          >
            <DibujoEstado estado={estado?.id ?? null} vivo="siempre" autonomo />
            <ReflejoVidrio />
          </div>
        </div>
      </Burbuja>

      <Burbuja tono="cielo" entrada="ninguna" interior="flex flex-col gap-6">
        <h2 className="text-titulo-m font-light md:text-titulo-l">Ventanas de este estado</h2>
        <GrillaDeVentanas
          temas={propias}
          estados={estados}
          final={
            propias?.length === 0 ? (
              <p className="max-w-angosto text-center text-cuerpo text-mar-tintaSuave">Todavía no hay ventanas en este estado. Se van sumando con el tiempo.</p>
            ) : null
          }
        />
      </Burbuja>

      {otros && (
        <nav aria-label="Otros estados del mar" className="flex flex-wrap items-center gap-2 px-2">
          <span className="mr-2 text-cuerpo text-mar-tintaSuave">Otros estados:</span>
          {otros.map((e) => (
            <Link key={e.id} to={urlDeEstado(e.id)} className="inline-flex min-h-control-sm items-center rounded-full border border-mar-bordeControl bg-mar-blanco/60 px-4 text-cuerpo text-mar-tinta no-underline hover:bg-mar-blanco">
              {e.nombre}
            </Link>
          ))}
        </nav>
      )}
    </Pagina>
  )
}
