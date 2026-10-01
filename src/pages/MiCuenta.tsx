import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSesion } from '../auth/SesionContext'
import Aviso from '../componentes/base/Aviso'
import Esqueleto from '../componentes/base/Esqueleto'
import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import BienvenidaCuenta from '../componentes/cuenta/BienvenidaCuenta'
import CambiarContrasena from '../componentes/cuenta/CambiarContrasena'
import DatosCuenta from '../componentes/cuenta/DatosCuenta'
import EstadoSuscripcion from '../componentes/cuenta/EstadoSuscripcion'
import EliminarCuenta from '../componentes/cuenta/EliminarCuenta'
import Pagina from '../componentes/layout/Pagina'
import { obtenerSuscripcion } from '../datos/contenido'
import { useCarga } from '../lib/useCarga'

// Lo que se cuenta al volver de Mercado Pago a esta pantalla (viaja por el estado de navegación).
const avisosDeVuelta: Record<string, string> = {
  tarjeta: 'Actualizamos tu medio de pago.',
  bienvenida: 'Listo, ya tenés tu cuenta. Para abrir los temas, activá el plan acá abajo.',
}
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
    <Pagina ancho="ancho">
      <BienvenidaCuenta usuario={usuario} />
      {aviso && <Aviso tono="info">{aviso}</Aviso>}
      {/* Lo importante (la suscripción) a la izquierda; los datos y lo que casi no se toca, al costado. */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        {error ? (
          <ErrorDeCarga texto="No pudimos leer el estado de tu suscripción." onReintentar={reintentar} />
        ) : cargando ? (
          <Esqueleto className="h-44" />
        ) : (
          <EstadoSuscripcion suscripcion={suscripcion} avisar={setAviso} />
        )}
        <div className="flex flex-col gap-6">
          <DatosCuenta usuario={usuario} avisar={setAviso} />
          <CambiarContrasena usuario={usuario} avisar={setAviso} />
          {/* Sin saber el estado de la suscripción no se ofrece borrar la cuenta: no se podría decir qué pasa con ella.
              La cuenta administradora no se borra desde acá (la función también lo rechaza). */}
          {!cargando && !error && rol !== 'admin' && <EliminarCuenta suscripcion={suscripcion} />}
        </div>
      </div>
    </Pagina>
  )
}
