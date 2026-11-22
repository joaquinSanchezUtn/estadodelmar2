import { useState } from 'react'
import { Link } from 'react-router-dom'
import FilaEstado from '../componentes/admin/FilaEstado'
import MarcoAdmin from '../componentes/admin/MarcoAdmin'
import { SIN_VENTANA } from '../componentes/admin/seccionesDelPanel'
import { useDatosAdmin } from '../componentes/admin/useDatosAdmin'
import Aviso from '../componentes/base/Aviso'
import Boton from '../componentes/base/Boton'
import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import Esqueleto from '../componentes/base/Esqueleto'

// El primer escalón de «Ventanas y temas»: las ventanas de «¿Cómo está tu mar hoy?», en el orden de la home.
// Se entra a una para ver y crear sus temas; adentro de cada tema van sus videos.
export default function AdminEstados() {
  const { datos, cargando, error, reintentar } = useDatosAdmin()
  const [aviso, setAviso] = useState<string | null>(null)
  const alCambiar = (texto: string) => {
    setAviso(texto)
    reintentar()
  }
  const sueltos = datos?.temas.filter((t) => !t.estadoMar).length ?? 0

  return (
    <MarcoAdmin
      titulo="Ventanas y temas"
      migas={[{ texto: 'Panel', to: '/admin' }, { texto: 'Ventanas y temas' }]}
      acciones={<Boton to="/admin/estados/nueva">+ Nueva ventana</Boton>}
    >
      <p className="max-w-parrafo text-destacado text-mar-tintaSuave">
        Estas son las ventanas de «¿Cómo está tu mar hoy?», en el mismo orden que en el sitio. Tocá una para ver sus temas o agregarle uno nuevo.
      </p>
      {error ? (
        <ErrorDeCarga texto="No pudimos leer las ventanas." onReintentar={reintentar} />
      ) : cargando || !datos ? (
        <div role="status" className="flex flex-col gap-3">
          <p className="sr-only">Cargando las ventanas…</p>
          {Array.from({ length: 4 }, (_, i) => (
            <Esqueleto key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          {aviso && <Aviso tono="info">{aviso}</Aviso>}
          {datos.estados.length === 0 ? (
            <p className="rounded-tarjeta border border-dashed border-mar-bordeAgua bg-mar-blanco/60 p-6 text-destacado text-mar-tintaSuave">
              Todavía no hay ventanas. Creá la primera con «+ Nueva ventana».
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {datos.estados.map((e, i) => (
                <FilaEstado key={e.id} estado={e} temas={datos.temas.filter((t) => t.estadoMar === e.id).length} posicion={i} total={datos.estados.length} onCambio={alCambiar} />
              ))}
            </ul>
          )}
          {sueltos > 0 && (
            <Link
              to={`/admin/estados/${SIN_VENTANA}`}
              className="rounded-burbuja border-2 border-dashed border-mar-bordeControl bg-mar-blanco/60 p-5 text-destacado text-mar-tinta no-underline hover:border-mar-primario"
            >
              <strong>
                {sueltos} {sueltos === 1 ? 'tema' : 'temas'} sin ventana
              </strong>{' '}
              — no se ven desde «¿Cómo está tu mar hoy?». Tocá acá para pasarlos a una ventana.
            </Link>
          )}
        </>
      )}
    </MarcoAdmin>
  )
}
