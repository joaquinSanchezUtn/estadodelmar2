import { useState } from 'react'
import { Link } from 'react-router-dom'
import SoloVisitantes from '../auth/SoloVisitantes'
import FormularioRecuperar from '../componentes/acceso/FormularioRecuperar'
import PaginaDeAcceso from '../componentes/acceso/PaginaDeAcceso'
import Aviso from '../componentes/base/Aviso'

const volver = (
  <Link to="/ingresar" className="inline-flex min-h-control-sm items-center text-cuerpo underline">
    Volver a ingresar
  </Link>
)

export default function Recuperar() {
  const [enviadoA, setEnviadoA] = useState<string | null>(null)

  return (
    <SoloVisitantes>
      {enviadoA ? (
        <PaginaDeAcceso titulo="Revisá tu correo">
          <Aviso tono="info" className="mb-6">
            Si {enviadoA} tiene una cuenta, te mandamos un enlace para elegir una contraseña nueva. Puede tardar unos
            minutos; mirá también en la carpeta de spam.
          </Aviso>
          {volver}
        </PaginaDeAcceso>
      ) : (
        <PaginaDeAcceso titulo="Recuperar la contraseña" texto="Escribí tu email y te mandamos un enlace para elegir una nueva.">
          <FormularioRecuperar onEnviado={setEnviadoA} />
          <div className="mt-6">{volver}</div>
        </PaginaDeAcceso>
      )}
    </SoloVisitantes>
  )
}
