import { useNavigate } from 'react-router-dom'
import { cambiarMedioDePago } from '../../datos/contenido'
import type { Suscripcion } from '../../datos/tipos'
import { fechaLarga } from '../../lib/formato'
import { useAccion } from '../../lib/useAccion'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import TarjetaSuscripcion from './TarjetaSuscripcion'
import { irAlPago } from './irAlPago'

type Props = { suscripcion: Extract<Suscripcion, { estado: 'en_gracia' }> }

// No pudimos cobrar el último período: hay 3 días de gracia con acceso mientras se resuelve. El único
// camino de vuelta es cambiar el medio de pago (la suscripción sigue viva en Mercado Pago, no hay
// nada que "reactivar" acá — por eso no comparte pantalla con `SuscripcionCancelada`).
export default function SuscripcionEnGracia({ suscripcion }: Props) {
  const navegar = useNavigate()
  const { pendiente, error, ejecutar } = useAccion()

  const actualizarTarjeta = () => ejecutar(async () => (irAlPago(await cambiarMedioDePago(), navegar), null))

  return (
    <TarjetaSuscripcion sello={{ tono: 'coral', texto: 'Pago rebotado' }}>
      <p className="mb-5 text-cuerpo text-mar-tintaSuave">
        No pudimos cobrar tu último período. Todavía tenés acceso hasta el{' '}
        <strong className="font-medium text-mar-tinta">{fechaLarga(suscripcion.accesoHasta)}</strong>: actualizá tu
        medio de pago antes de esa fecha para que no se corte.
      </p>
      <Boton onClick={actualizarTarjeta} disabled={pendiente} aria-busy={pendiente}>
        {pendiente ? 'Te llevamos a Mercado Pago…' : 'Actualizar el medio de pago'}
      </Boton>
      {error && <Aviso className="mt-4">{error}</Aviso>}
    </TarjetaSuscripcion>
  )
}
