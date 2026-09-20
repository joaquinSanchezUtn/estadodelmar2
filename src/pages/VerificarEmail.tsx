import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SoloVisitantes from '../auth/SoloVisitantes'
import { useSesion } from '../auth/SesionContext'
import { SimularCorreo } from '../componentes/acceso/AyudaDeDesarrollo'
import PaginaDeAcceso from '../componentes/acceso/PaginaDeAcceso'
import Aviso from '../componentes/base/Aviso'
import Boton from '../componentes/base/Boton'

const ESPERA_S = 60

// El email viaja por el estado de navegación (no por la URL). Si se recargó la página y se perdió,
// el texto se dice sin el email.
export default function VerificarEmail() {
  const { reenviarConfirmacion } = useSesion()
  const email = (useLocation().state as { email?: string } | null)?.email
  const [espera, setEspera] = useState(ESPERA_S)
  const [reenviado, setReenviado] = useState(false)

  useEffect(() => {
    if (espera <= 0) return
    const t = setTimeout(() => setEspera((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [espera])

  const reenviar = async () => {
    setEspera(ESPERA_S)
    setReenviado(false)
    if (email) await reenviarConfirmacion(email)
    setReenviado(true)
  }

  return (
    <SoloVisitantes>
      <PaginaDeAcceso
        titulo="Revisá tu correo"
        texto={
          email
            ? `Te mandamos un enlace a ${email} para confirmar tu cuenta. Puede tardar unos minutos; mirá también en spam.`
            : 'Te mandamos un enlace para confirmar tu cuenta. Puede tardar unos minutos; mirá también en spam.'
        }
      >
        <Boton variante="secundario" onClick={reenviar} disabled={espera > 0} className="w-full">
          {espera > 0 ? `Reenviar el correo en ${espera} s` : 'Reenviar el correo'}
        </Boton>
        {reenviado && (
          <Aviso tono="info" className="mt-4">
            Listo, te lo mandamos de nuevo.
          </Aviso>
        )}
        <p className="mt-6 text-cuerpo text-mar-tintaSuave">
          ¿Te equivocaste de email?{' '}
          <Link to="/registrarme" className="inline-flex min-h-control-sm items-center underline">
            Crear la cuenta otra vez
          </Link>
        </p>
        <SimularCorreo tipo="confirmacion" />
      </PaginaDeAcceso>
    </SoloVisitantes>
  )
}
