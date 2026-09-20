import { useState } from 'react'
import { useSesion } from '../auth/SesionContext'
import FormularioNuevaContrasena from '../componentes/acceso/FormularioNuevaContrasena'
import PaginaDeAcceso from '../componentes/acceso/PaginaDeAcceso'
import Boton from '../componentes/base/Boton'

// Solo se llega desde el enlace del correo (que pasa por /auth/callback). Sin ese enlace no hay
// nada que cambiar: se explica y se ofrece pedir otro.
export default function NuevaContrasena() {
  const { enRecuperacion } = useSesion()
  const [listo, setListo] = useState(false)

  if (listo) {
    return (
      <PaginaDeAcceso titulo="Listo" texto="Cambiaste tu contraseña. Ya estás adentro con tu cuenta.">
        <Boton to="/">Ir al inicio</Boton>
      </PaginaDeAcceso>
    )
  }

  if (!enRecuperacion) {
    return (
      <PaginaDeAcceso titulo="Este enlace no es válido" texto="Venció o ya se usó. Podés pedir uno nuevo.">
        <Boton to="/recuperar">Pedir un enlace nuevo</Boton>
      </PaginaDeAcceso>
    )
  }

  return (
    <PaginaDeAcceso titulo="Elegí una contraseña nueva" texto="Usala la próxima vez que ingreses.">
      <FormularioNuevaContrasena onListo={() => setListo(true)} />
    </PaginaDeAcceso>
  )
}
