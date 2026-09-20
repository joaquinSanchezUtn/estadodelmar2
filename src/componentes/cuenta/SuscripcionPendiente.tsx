import { useSesion } from '../../auth/SesionContext'
import { useAccion } from '../../lib/useAccion'
import Boton from '../base/Boton'
import TarjetaSuscripcion from './TarjetaSuscripcion'

// El pago todavía no se acreditó (por ejemplo, efectivo o transferencia). No hay acceso hasta que llegue.
export default function SuscripcionPendiente() {
  const { refrescarSesion } = useSesion()
  const { pendiente, ejecutar } = useAccion()

  return (
    <TarjetaSuscripcion sello={{ tono: 'neutro', texto: 'Pago pendiente' }}>
      <p className="mb-5 text-cuerpo text-mar-tintaSuave">
        Estamos esperando que se acredite tu pago. Puede tardar hasta unos días según el medio que hayas elegido. Apenas
        llegue, tu acceso se activa solo y te avisamos por correo. Mientras tanto no se te cobra de nuevo.
      </p>
      <Boton
        variante="secundario"
        onClick={() => ejecutar(async () => (await refrescarSesion(), null))}
        disabled={pendiente}
        aria-busy={pendiente}
      >
        {pendiente ? 'Revisando…' : 'Revisar si ya se acreditó'}
      </Boton>
    </TarjetaSuscripcion>
  )
}
