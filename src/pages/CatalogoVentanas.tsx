import { useSearchParams } from 'react-router-dom'
import Boton from '../componentes/base/Boton'
import Burbuja from '../componentes/base/Burbuja'
import Campo from '../componentes/base/Campo'
import Pagina from '../componentes/layout/Pagina'
import FiltroDeEnfoques from '../componentes/ventana/FiltroDeEnfoques'
import FiltroDeEstados from '../componentes/ventana/FiltroDeEstados'
import GrillaDeVentanas from '../componentes/ventana/GrillaDeVentanas'
import { listarEnfoques, listarEstados, listarTemas } from '../datos/contenido'
import type { EnfoqueId, EstadoMarId } from '../datos/tipos'
import { coincide } from '../lib/buscar'
import { useCarga } from '../lib/useCarga'

const enfoques = listarEnfoques()

// Todas las ventanas, con búsqueda y filtros por estado y por enfoque. Viven en la URL (?q=, ?estado=, ?enfoque=):
// se puede compartir y anda el «atrás». Los títulos son públicos: cualquiera puede buscar.
export default function CatalogoVentanas() {
  const [params, setParams] = useSearchParams()
  const { datos: estados } = useCarga('estados', listarEstados, true)
  const { datos: temas } = useCarga('temas', listarTemas, true)

  const consulta = params.get('q') ?? ''
  const activo = estados?.find((e) => e.id === params.get('estado'))?.id ?? null
  const enfoque = enfoques.find((f) => f.id === params.get('enfoque'))?.id ?? null

  const cambiar = (q: string, estado: EstadoMarId | null, enf: EnfoqueId | null) => {
    const nuevos = new URLSearchParams()
    if (q) nuevos.set('q', q)
    if (estado) nuevos.set('estado', estado)
    if (enf) nuevos.set('enfoque', enf)
    setParams(nuevos, { replace: true })
  }

  // Cada filtro cuenta sobre lo que dejan pasar los otros dos, así el número dice cuántas va a ver.
  const porBusqueda = temas?.filter((t) => coincide(consulta, t.titulo, t.descripcion)) ?? null
  const porEnfoque = porBusqueda && enfoque ? porBusqueda.filter((t) => t.enfoque === enfoque) : porBusqueda
  const porEstado = porBusqueda && activo ? porBusqueda.filter((t) => t.estadoMar === activo) : porBusqueda
  const visibles = porEnfoque && activo ? porEnfoque.filter((t) => t.estadoMar === activo) : porEnfoque
  const cantidades: Partial<Record<EstadoMarId, number>> = {}
  porEnfoque?.forEach((t) => t.estadoMar && (cantidades[t.estadoMar] = (cantidades[t.estadoMar] ?? 0) + 1))
  const cantidadesEnfoque: Partial<Record<EnfoqueId, number>> = {}
  porEstado?.forEach((t) => t.enfoque && (cantidadesEnfoque[t.enfoque] = (cantidadesEnfoque[t.enfoque] ?? 0) + 1))
  const hayFiltro = Boolean(consulta || activo || enfoque)

  return (
    <Pagina ancho="ancho">
      <Burbuja tono="cielo" entrada="ninguna" interior="flex flex-col gap-6">
        <div>
          <h1 className="mb-2 text-titulo-m font-light md:text-titulo-l">Todas las ventanas</h1>
          <p className="max-w-parrafo text-cuerpo text-mar-tintaSuave">
            Buscá por tema, o elegí un estado del mar o un enfoque. Los títulos los ve cualquiera; el contenido es para suscriptoras.
          </p>
        </div>

        <Campo
          etiqueta="Buscar una ventana"
          type="search"
          value={consulta}
          onChange={(e) => cambiar(e.target.value, activo, enfoque)}
          placeholder="Ansiedad, pareja, sentido de la vida…"
          autoComplete="off"
        />
        {estados && <FiltroDeEstados estados={estados} activo={activo} cantidades={cantidades} onElegir={(id) => cambiar(consulta, id, enfoque)} />}
        <FiltroDeEnfoques enfoques={enfoques} activo={enfoque} cantidades={cantidadesEnfoque} onElegir={(id) => cambiar(consulta, activo, id)} />

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
                  {hayFiltro ? 'No encontramos ventanas con eso. Probá con otra palabra, otro estado u otro enfoque.' : 'Todavía no hay ventanas publicadas.'}
                </p>
                {hayFiltro && (
                  <Boton compacto variante="secundario" onClick={() => cambiar('', null, null)}>
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
