import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import Boton from '../componentes/base/Boton'
import Esqueleto from '../componentes/base/Esqueleto'
import MarcoAdmin from '../componentes/admin/MarcoAdmin'
import ResumenAdmin from '../componentes/admin/ResumenAdmin'
import { useDatosAdmin } from '../componentes/admin/useDatosAdmin'

// La entrada al panel: un resumen de cómo está el sitio y qué falta hacer.
export default function Admin() {
  const { datos, cargando, error, reintentar } = useDatosAdmin()

  return (
    <MarcoAdmin
      titulo="Panel de administración"
      acciones={
        <Boton to="/admin/ventanas/nueva" compacto>
          Nueva ventana
        </Boton>
      }
    >
      {error ? (
        <ErrorDeCarga texto="No pudimos leer las ventanas." onReintentar={reintentar} />
      ) : cargando || !datos ? (
        <div role="status" className="grid gap-3 md:grid-cols-4">
          <p className="sr-only">Cargando el resumen…</p>
          {Array.from({ length: 4 }, (_, i) => (
            <Esqueleto key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <ResumenAdmin temas={datos.temas} />
      )}
    </MarcoAdmin>
  )
}
