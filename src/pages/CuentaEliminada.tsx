import { useEffect } from 'react'
import { useSesion } from '../auth/SesionContext'
import PaginaDeAcceso from '../componentes/acceso/PaginaDeAcceso'
import Boton from '../componentes/base/Boton'

// La despedida. La cuenta ya se borró en el servidor: acá se suelta la sesión local (después de
// llegar, así la pantalla protegida de la que se venía no te manda a Ingresar).
export default function CuentaEliminada() {
  const { cerrarSesion } = useSesion()
  useEffect(() => cerrarSesion(), [cerrarSesion])

  return (
    <PaginaDeAcceso
      titulo="Eliminamos tu cuenta"
      texto="Se borraron tu cuenta y tus datos, y cancelamos tu suscripción si tenías una. Gracias por haber pasado por acá."
    >
      <Boton to="/">Volver al inicio</Boton>
    </PaginaDeAcceso>
  )
}
