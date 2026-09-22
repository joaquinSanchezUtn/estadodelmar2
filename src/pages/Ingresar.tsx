import { Link } from 'react-router-dom'
import { useSesion } from '../auth/SesionContext'
import SoloVisitantes from '../auth/SoloVisitantes'
import BotonGoogle from '../componentes/acceso/BotonGoogle'
import FormularioIngreso from '../componentes/acceso/FormularioIngreso'
import PaginaDeAcceso from '../componentes/acceso/PaginaDeAcceso'
import SeparadorO from '../componentes/acceso/SeparadorO'
import Aviso from '../componentes/base/Aviso'

export default function Ingresar() {
  const { sesionVencida } = useSesion()

  return (
    <SoloVisitantes>
      <PaginaDeAcceso titulo="Ingresar" texto="Entrá a tu cuenta para acceder a las ventanas.">
        {sesionVencida && (
          <Aviso tono="info" className="mb-6">
            Tu sesión venció. Ingresá de nuevo para seguir donde estabas.
          </Aviso>
        )}
        <BotonGoogle />
        <SeparadorO />
        <FormularioIngreso />
        <p className="mt-6 text-cuerpo text-mar-tintaSuave">
          ¿No tenés cuenta?{' '}
          <Link to="/registrarme" className="inline-flex min-h-control-sm items-center underline">
            Crear cuenta
          </Link>
        </p>
      </PaginaDeAcceso>
    </SoloVisitantes>
  )
}
