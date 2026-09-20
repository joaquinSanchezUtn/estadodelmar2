import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSesion } from '../auth/SesionContext'
import Aviso from '../componentes/base/Aviso'
import Burbuja from '../componentes/base/Burbuja'
import Esqueleto from '../componentes/base/Esqueleto'
import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import CambiarContrasena from '../componentes/cuenta/CambiarContrasena'
import DatosCuenta from '../componentes/cuenta/DatosCuenta'
import EliminarCuenta from '../componentes/cuenta/EliminarCuenta'
import EstadoSuscripcion from '../componentes/cuenta/EstadoSuscripcion'
import Pagina from '../componentes/layout/Pagina'
import { obtenerSuscripcion } from '../datos/contenido'
import { useCarga } from '../lib/useCarga'

// Lo que se cuenta al volver de Mercado Pago a esta pantalla (viaja por el estado de navegación).
const avisosDeVuelta: Record<string, string> = { tarjeta: 'Actualizamos tu medio de pago.' }
const avisoDeVuelta = (clave?: string) => (clave && Object.hasOwn(avisosDeVuelta, clave) ? avisosDeVuelta[clave] : null)

export default function MiCuenta() {
  const { usuario, rol } = useSesion()
  const { state } = useLocation()
  const { datos: suscripcion, cargando, error, reintentar } = useCarga(`suscripcion:${usuario?.email ?? 'anonimo'}:${rol}`, obtenerSuscripcion)
  // El aviso vive acá y no en cada sección: refrescar la sesión vuelve a cargar la suscripción y
  // esas secciones se montan de nuevo.
  const [aviso, setAviso] = useState<string | null>(() => avisoDeVuelta((state as { aviso?: string } | null)?.aviso))

  if (!usuario) return null // la ruta ya redirige a quien no tiene sesión

  return (
    <Pagina ancho="lectura">
      <Burbuja tono="aguaClara" entrada="ninguna" interior="flex flex-col gap-6">
        <h1 className="text-titulo-m font-light md:text-titulo-l">Mi cuenta</h1>
        {aviso && <Aviso tono="info">{aviso}</Aviso>}
        <DatosCuenta usuario={usuario} avisar={setAviso} />
        {error ? (
          <ErrorDeCarga texto="No pudimos leer el estado de tu suscripción." onReintentar={reintentar} />
        ) : cargando ? (
          <Esqueleto className="h-44" />
        ) : (
          <EstadoSuscripcion suscripcion={suscripcion} avisar={setAviso} />
        )}
        <CambiarContrasena usuario={usuario} avisar={setAviso} />
        {/* Sin saber el estado de la suscripción no se ofrece borrar la cuenta: no se podría decir qué pasa con ella. */}
        {!cargando && !error && <EliminarCuenta suscripcion={suscripcion} />}
      </Burbuja>
    </Pagina>
  )
}
