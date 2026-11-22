import { useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import FilaTema from '../componentes/admin/FilaTema'
import MarcoAdmin from '../componentes/admin/MarcoAdmin'
import { SIN_VENTANA } from '../componentes/admin/seccionesDelPanel'
import { useDatosAdmin } from '../componentes/admin/useDatosAdmin'
import Aviso from '../componentes/base/Aviso'
import Boton from '../componentes/base/Boton'
import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import Esqueleto from '../componentes/base/Esqueleto'
import EstadoVacio from '../componentes/base/EstadoVacio'
import Sello from '../componentes/base/Sello'
import { urlDeEstado } from '../lib/estados'

// El segundo escalón: una ventana y sus temas. Desde acá se crea un tema que ya nace adentro de esta ventana
// (sin tener que elegirla), se abre uno para cargarle videos, y se cambian los datos de la ventana.
export default function AdminVentana() {
  const { id = '' } = useParams()
  const sinVentana = id === SIN_VENTANA
  const { datos, cargando, error, reintentar } = useDatosAdmin()
  const [aviso, setAviso] = useState<string | null>((useLocation().state as { aviso?: string } | null)?.aviso ?? null)
  const estado = datos?.estados.find((e) => e.id === id)
  const temas = datos?.temas.filter((t) => (sinVentana ? !t.estadoMar : t.estadoMar === id)) ?? []
  const nombre = sinVentana ? 'Temas sin ventana' : (estado?.nombre ?? 'Ventana')
  const migas = [{ texto: 'Panel', to: '/admin' }, { texto: 'Ventanas y temas', to: '/admin/estados' }, { texto: nombre }]
  const alCambiar = (texto: string) => {
    setAviso(texto)
    reintentar()
  }

  if (!sinVentana && datos && !estado) {
    return (
      <MarcoAdmin titulo="Ventana" migas={migas}>
        <EstadoVacio titulo="Esa ventana no existe" texto="Puede que la hayan borrado." enlace={{ to: '/admin/estados', texto: 'Ver todas las ventanas' }} />
      </MarcoAdmin>
    )
  }

  return (
    <MarcoAdmin
      titulo={nombre}
      migas={migas}
      acciones={
        estado && (
          <>
            <Boton variante="secundario" to={`/admin/estados/${estado.id}/editar`}>
              Cambiar esta ventana
            </Boton>
            {estado.publicado && (
              <Boton variante="secundario" to={urlDeEstado(estado.id)}>
                Verla en el sitio
              </Boton>
            )}
          </>
        )
      }
    >
      {estado && (
        <div className="flex flex-wrap items-center gap-3">
          <Sello tono={estado.publicado ? 'agua' : 'coral'}>{estado.publicado ? 'Esta ventana se ve en el sitio' : 'Esta ventana está oculta: no se ve en el sitio'}</Sello>
        </div>
      )}
      {sinVentana && <p className="max-w-parrafo text-destacado text-mar-tintaSuave">Estos temas no se ven desde ninguna ventana. Abrí cada uno y, en «Más opciones», elegí en qué ventana va.</p>}

      {error ? (
        <ErrorDeCarga texto="No pudimos leer los temas." onReintentar={reintentar} />
      ) : cargando || !datos ? (
        <div role="status" className="flex flex-col gap-3">
          <p className="sr-only">Cargando los temas…</p>
          <Esqueleto className="h-32" />
          <Esqueleto className="h-32" />
        </div>
      ) : (
        <section aria-labelledby="titulo-temas" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="titulo-temas" className="text-titulo-m">
              {sinVentana ? 'Temas' : 'Temas de esta ventana'}
            </h2>
            {estado && <Boton to={`/admin/ventanas/nueva?ventana=${estado.id}`}>+ Nuevo tema</Boton>}
          </div>
          {aviso && <Aviso tono="info">{aviso}</Aviso>}
          {temas.length === 0 ? (
            <p className="rounded-tarjeta border border-dashed border-mar-bordeAgua bg-mar-blanco/60 p-6 text-destacado text-mar-tintaSuave">
              Esta ventana todavía no tiene temas. Creá el primero con «+ Nuevo tema».
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {temas.map((t, i) => (
                <FilaTema key={t.slug} tema={t} estilo={estado?.estilo ?? null} posicion={i} total={temas.length} onCambio={alCambiar} />
              ))}
            </ul>
          )}
        </section>
      )}
    </MarcoAdmin>
  )
}
