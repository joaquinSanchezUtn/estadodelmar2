import { useSesion } from '../auth/SesionContext'
import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import Boton from '../componentes/base/Boton'
import Esqueleto from '../componentes/base/Esqueleto'
import MarcoAdmin from '../componentes/admin/MarcoAdmin'
import ResumenAdmin from '../componentes/admin/ResumenAdmin'
import { useDatosAdmin } from '../componentes/admin/useDatosAdmin'
import { listarMensajesAdmin } from '../datos/admin'
import { obtenerQuienSoy } from '../datos/contenido'
import { useCarga } from '../lib/useCarga'

// La entrada al panel: un resumen de cómo está el sitio y qué falta hacer. Los mensajes y "Quién soy"
// solo suman pasos: si no se pueden leer, el resumen de los temas se muestra igual.
export default function Admin() {
  const { usuario } = useSesion()
  const { datos, cargando, error, reintentar } = useDatosAdmin()
  const { datos: mensajes } = useCarga('admin:mensajes', listarMensajesAdmin)
  const { datos: quienSoy } = useCarga('admin:quien-soy', obtenerQuienSoy)
  const nombre = usuario?.nombre.trim().split(' ')[0]

  return (
    <MarcoAdmin
      titulo={nombre ? `Hola, ${nombre}` : 'Hola'}
      acciones={
        <Boton to="/admin/ventanas/nueva" compacto>
          Nuevo tema
        </Boton>
      }
    >
      {error ? (
        <ErrorDeCarga texto="No pudimos leer los temas." onReintentar={reintentar} />
      ) : cargando || !datos ? (
        <div role="status" className="grid gap-3 md:grid-cols-4">
          <p className="sr-only">Cargando el resumen…</p>
          {Array.from({ length: 4 }, (_, i) => (
            <Esqueleto key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <ResumenAdmin temas={datos.temas} estados={datos.estados} sinLeer={mensajes?.filter((m) => !m.leido).length ?? 0} quienSoy={quienSoy ?? null} />
      )}
    </MarcoAdmin>
  )
}
