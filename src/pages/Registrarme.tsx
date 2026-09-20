import { Link } from 'react-router-dom'
import SoloVisitantes from '../auth/SoloVisitantes'
import BotonGoogle from '../componentes/acceso/BotonGoogle'
import FormularioRegistro from '../componentes/acceso/FormularioRegistro'
import PaginaDeAcceso from '../componentes/acceso/PaginaDeAcceso'
import SeparadorO from '../componentes/acceso/SeparadorO'

export default function Registrarme() {
  return (
    <SoloVisitantes>
      <PaginaDeAcceso titulo="Crear cuenta" texto="Con tu cuenta podés suscribirte y acceder a las ventanas.">
        <BotonGoogle />
        <SeparadorO />
        <FormularioRegistro />
        <p className="mt-6 text-cuerpo text-mar-tintaSuave">
          ¿Ya tenés cuenta?{' '}
          <Link to="/ingresar" className="inline-flex min-h-control-sm items-center underline">
            Ingresar
          </Link>
        </p>
      </PaginaDeAcceso>
    </SoloVisitantes>
  )
}
