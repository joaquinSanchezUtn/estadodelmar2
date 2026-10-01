import { Link } from 'react-router-dom'
import { useSesion } from '../../auth/SesionContext'
import { mensajeDeError } from '../../auth/mensajes'
import { useAccion } from '../../lib/useAccion'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import { Google } from '../base/iconos'

// Ingresar (o crear la cuenta, es lo mismo) con Google. Quien entra por acá no marca la casilla de los
// términos del registro: por eso el aviso de abajo, como en cualquier "Continuar con Google".
export default function BotonGoogle() {
  const { ingresarConGoogle } = useSesion()
  const { pendiente, error, ejecutar } = useAccion()

  const continuar = () =>
    ejecutar(async () => {
      const r = await ingresarConGoogle()
      return r.ok ? null : mensajeDeError[r.error]
    })

  return (
    <div className="flex flex-col gap-2">
      <Boton variante="secundario" onClick={continuar} disabled={pendiente} aria-busy={pendiente} className="w-full gap-3 bg-mar-blanco">
        <Google />
        {pendiente ? 'Abriendo Google…' : 'Continuar con Google'}
      </Boton>
      {error && <Aviso>{error}</Aviso>}
      <p className="text-meta text-mar-tintaSuave">
        Al continuar con Google aceptás los <Link to="/terminos">Términos</Link> y la <Link to="/privacidad">Política de privacidad</Link>.
      </p>
    </div>
  )
}
