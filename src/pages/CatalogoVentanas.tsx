import { useSearchParams } from 'react-router-dom'
import Boton from '../componentes/base/Boton'
import Burbuja from '../componentes/base/Burbuja'
import Campo from '../componentes/base/Campo'
import Pagina from '../componentes/layout/Pagina'
import FiltroDeEstados from '../componentes/ventana/FiltroDeEstados'
import GrillaDeVentanas from '../componentes/ventana/GrillaDeVentanas'
import { listarEstados, listarTemas } from '../datos/contenido'
import type { EstadoMarId } from '../datos/tipos'
import { coincide } from '../lib/buscar'
import { useCarga } from '../lib/useCarga'

// Todas las ventanas, con búsqueda y filtro por estado. Los dos viven en la URL (?q= y ?estado=):
// se puede compartir y anda el «atrás». Los títulos son públicos: cualquiera puede buscar.
export default function CatalogoVentanas() {
  const [params, setParams] = useSearchParams()
  const { datos: estados } = useCarga('estados', listarEstados, true)
  const { datos: temas } = useCarga('temas', listarTemas, true)

  const consulta = params.get('q') ?? ''
  const activo = estados?.find((e) => e.id === params.get('estado'))?.id ?? null

  const cambiar = (q: string, estado: EstadoMarId | null) => {
    const nuevos = new URLSearchParams()
    if (q) nuevos.set('q', q)
    if (estado) nuevos.set('estado', estado)
    setParams(nuevos, { replace: true })
  }

  const porBusqueda = temas?.filter((t) => coincide(consulta, t.titulo, t.descripcion)) ?? null
  const visibles = porBusqueda && activo ? porBusqueda.filter((t) => t.estadoMar === activo) : porBusqueda
  const cantidades: Partial<Record<EstadoMarId, number>> = {}
  porBusqueda?.forEach((t) => t.estadoMar && (cantidades[t.estadoMar] = (cantidades[t.estadoMar] ?? 0) + 1))
  const hayFiltro = Boolean(consulta || activo)

  return (
    <Pagina ancho="ancho">
      <Burbuja tono="cielo" entrada="ninguna" interior="flex flex-col gap-6">
        <div>
          <h1 className="mb-2 text-titulo-m font-light md:text-titulo-l">Todas las ventanas</h1>
          <p className="max-w-parrafo text-cuerpo text-mar-tintaSuave">
            Buscá por tema o elegí un estado del mar. Los títulos los ve cualquiera; el contenido es para suscriptoras.
          </p>
        </div>

        <Campo
          etiqueta="Buscar una ventana"
          type="search"
          value={consulta}
          onChange={(e) => cambiar(e.target.value, activo)}
          placeholder="Ansiedad, pareja, sentido de la vida…"
          autoComplete="off"
        />
        {estados && <FiltroDeEstados estados={estados} activo={activo} cantidades={cantidades} onElegir={(id) => cambiar(consulta, id)} />}

        <p role="status" className="text-cuerpo text-mar-tintaSuave">
          {visibles ? `${visibles.length} ${visibles.length === 1 ? 'ventana' : 'ventanas'}` : 'Cargando las ventanas…'}
        </p>

        <GrillaDeVentanas
          temas={visibles}
          estados={estados}
          final={
            visibles?.length === 0 ? (
              <div className="flex max-w-angosto flex-col items-center gap-4 text-center">
                <p className="text-cuerpo text-mar-tintaSuave">
                  {hayFiltro ? 'No encontramos ventanas con eso. Probá con otra palabra o con otro estado.' : 'Todavía no hay ventanas publicadas.'}
                </p>
                {hayFiltro && (
                  <Boton compacto variante="secundario" onClick={() => cambiar('', null)}>
                    Limpiar la búsqueda
                  </Boton>
                )}
              </div>
            ) : null
          }
        />
      </Burbuja>
    </Pagina>
  )
}
