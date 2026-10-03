import { useState } from 'react'
import FilaEstado from '../componentes/admin/FilaEstado'
import MarcoAdmin from '../componentes/admin/MarcoAdmin'
import { useDatosAdmin } from '../componentes/admin/useDatosAdmin'
import Aviso from '../componentes/base/Aviso'
import Boton from '../componentes/base/Boton'
import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import Esqueleto from '../componentes/base/Esqueleto'

// Las ventanas de "¿Cómo está tu mar hoy?" (tabla `estados`), en el orden de la home: se ordenan acá y se
// crean, editan, ocultan y borran desde su pantalla.
export default function AdminEstados() {
  const { datos, cargando, error, reintentar } = useDatosAdmin()
  const [aviso, setAviso] = useState<string | null>(null)
  const alCambiar = (texto: string) => {
    setAviso(texto)
    reintentar()
  }

  return (
    <MarcoAdmin
      titulo="Ventanas"
      migas={[{ texto: 'Panel', to: '/admin' }, { texto: 'Ventanas' }]}
      acciones={
        <Boton to="/admin/estados/nueva" compacto>
          Nueva ventana
        </Boton>
      }
    >
      <p className="max-w-parrafo text-cuerpo text-mar-tintaSuave">
        Son las tarjetas de «¿Cómo está tu mar hoy?», en este mismo orden. Cada una lleva su foto (o el dibujo de su aspecto) y reúne los temas que le asignes.
      </p>
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
          {aviso && <Aviso tono="info">{aviso}</Aviso>}
          {datos.estados.length === 0 ? (
            <p className="rounded-tarjeta border border-dashed border-mar-bordeAgua bg-mar-blanco/60 p-6 text-cuerpo text-mar-tintaSuave">
              Todavía no hay ventanas. Creá la primera con «Nueva ventana».
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {datos.estados.map((e, i) => (
                <FilaEstado key={e.id} estado={e} temas={datos.temas.filter((t) => t.estadoMar === e.id).length} posicion={i} total={datos.estados.length} onCambio={alCambiar} />
              ))}
            </ul>
          )}
        </>
      )}
    </MarcoAdmin>
  )
}
