import { useSearchParams } from 'react-router-dom'
import Boton from '../componentes/base/Boton'
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
      <header className="mx-auto flex max-w-parrafo flex-col items-center pt-4 text-center md:pt-8">
        <h1 className="mb-3 text-titulo-l md:text-titulo-xl">Todos los temas</h1>
        <p className="text-destacado text-mar-tintaSuave">
          Buscá por nombre, o elegí cómo está tu mar o desde dónde querés mirarlo. Los títulos los ve cualquiera; el contenido es para
          suscriptoras.
        </p>
      </header>

      <div className="flex flex-col gap-5 rounded-burbujaGrande border border-mar-bordeAgua bg-mar-blanco p-5 shadow-suave md:p-6">
        <Campo
          etiqueta="Buscar un tema"
          type="search"
          value={consulta}
          onChange={(e) => cambiar(e.target.value, activo, enfoque)}
          placeholder="Ansiedad, pareja, sentido de la vida…"
          autoComplete="off"
        />
        {estados && <FiltroDeEstados estados={estados} activo={activo} cantidades={cantidades} onElegir={(id) => cambiar(consulta, id, enfoque)} />}
        <FiltroDeEnfoques enfoques={enfoques} activo={enfoque} cantidades={cantidadesEnfoque} onElegir={(id) => cambiar(consulta, activo, id)} />
      </div>

      <p role="status" className="text-center text-cuerpo font-medium text-mar-tintaSuave">
        {visibles ? `${visibles.length} ${visibles.length === 1 ? 'tema' : 'temas'}` : 'Cargando los temas…'}
      </p>

        <GrillaDeVentanas
          temas={visibles}
          estados={estados}
          final={
            visibles?.length === 0 ? (
              <div className="flex flex-col items-start gap-4 rounded-burbuja border border-dashed border-mar-bordeAgua bg-mar-blanco/60 p-5">
                <p className="text-cuerpo text-mar-tintaSuave">
                  {hayFiltro ? 'No encontramos temas con eso. Probá con otra palabra, otro estado u otro enfoque.' : 'Todavía no hay temas publicados.'}
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
    </Pagina>
  )
}
