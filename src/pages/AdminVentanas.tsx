import { useState } from 'react'
import Aviso from '../componentes/base/Aviso'
import Boton from '../componentes/base/Boton'
import Campo from '../componentes/base/Campo'
import Esqueleto from '../componentes/base/Esqueleto'
import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import FilaVentana from '../componentes/admin/FilaVentana'
import MarcoAdmin from '../componentes/admin/MarcoAdmin'
import { useDatosAdmin } from '../componentes/admin/useDatosAdmin'
import { coincide } from '../lib/buscar'

// Todas las ventanas, con borradores: se ordenan, se publican, se editan y se eliminan desde acá.
export default function AdminVentanas() {
  const { datos, cargando, error, reintentar } = useDatosAdmin()
  const [busqueda, setBusqueda] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)

  const alCambiar = (texto: string) => {
    setAviso(texto)
    reintentar()
  }
  const visibles = datos?.temas.filter((t) => coincide(busqueda, t.titulo, t.slug)) ?? []

  return (
    <MarcoAdmin
      titulo="Ventanas"
      migas={[{ texto: 'Panel', to: '/admin' }, { texto: 'Ventanas' }]}
      acciones={
        <Boton to="/admin/ventanas/nueva" compacto>
          Nueva ventana
        </Boton>
      }
    >
      {error ? (
        <ErrorDeCarga texto="No pudimos leer las ventanas." onReintentar={reintentar} />
      ) : cargando || !datos ? (
        <div role="status" className="flex flex-col gap-3">
          <p className="sr-only">Cargando las ventanas…</p>
          {Array.from({ length: 4 }, (_, i) => (
            <Esqueleto key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <>
          <Campo etiqueta="Buscar una ventana" type="search" autoComplete="off" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Ansiedad, pareja…" />
          {aviso && <Aviso tono="info">{aviso}</Aviso>}
          {busqueda && <p className="text-meta text-mar-tintaSuave">Para ordenar las ventanas, borrá la búsqueda.</p>}
          {visibles.length === 0 ? (
            <p className="rounded-tarjeta border border-dashed border-mar-bordeAgua bg-mar-blanco/60 p-6 text-cuerpo text-mar-tintaSuave">
              {datos.temas.length === 0 ? 'Todavía no hay ventanas. Creá la primera con «Nueva ventana».' : 'No hay ventanas con ese nombre.'}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {visibles.map((t) => (
                <FilaVentana key={t.slug} tema={t} estados={datos.estados} posicion={datos.temas.indexOf(t)} total={datos.temas.length} puedeOrdenar={!busqueda} onCambio={alCambiar} />
              ))}
            </ul>
          )}
        </>
      )}
    </MarcoAdmin>
  )
}
