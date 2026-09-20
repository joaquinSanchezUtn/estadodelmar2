import { useSesion } from '../auth/SesionContext'
import Esqueleto from '../componentes/base/Esqueleto'
import DatosCuenta from '../componentes/cuenta/DatosCuenta'
import EstadoSuscripcion from '../componentes/cuenta/EstadoSuscripcion'
import Seccion from '../componentes/layout/Seccion'
import { obtenerSuscripcion } from '../datos/contenido'
import { useCarga } from '../lib/useCarga'

export default function MiCuenta() {
  const { usuario, rol } = useSesion()
  const { datos: suscripcion, cargando } = useCarga(obtenerSuscripcion, [rol])

  if (!usuario) return null // la ruta ya redirige a quien no tiene sesión

  return (
    <Seccion fondo="degrade" angosta className="flex flex-col gap-5 md:gap-6">
      <h1 className="text-4xl font-light">Mi cuenta</h1>
      <DatosCuenta usuario={usuario} />
      {cargando ? (
        <Esqueleto className="h-44" />
      ) : (
        <EstadoSuscripcion suscripcion={suscripcion} />
      )}
    </Seccion>
  )
}
