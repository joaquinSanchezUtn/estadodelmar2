import { useNavigate } from 'react-router-dom'
import { cambiarMedioDePago, iniciarSuscripcion } from '../../datos/contenido'
import type { Suscripcion } from '../../datos/tipos'
import { fechaLarga } from '../../lib/formato'
import { useAccion } from '../../lib/useAccion'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import TarjetaSuscripcion from './TarjetaSuscripcion'
import { irAlPago } from './irAlPago'

// El cobro falló o venció: sin acceso hasta reactivarla. Se ofrece el camino más corto para volver.
export default function SuscripcionVencida({ suscripcion }: { suscripcion: Extract<Suscripcion, { estado: 'vencida' }> }) {
  const navegar = useNavigate()
  const reactivar = useAccion()
  const tarjeta = useAccion()

  return (
    <TarjetaSuscripcion sello={{ tono: 'coral', texto: 'Vencida' }}>
      <p className="mb-5 text-cuerpo text-mar-tintaSuave">
        No pudimos cobrar tu suscripción y venció el {fechaLarga(suscripcion.desde)}. Perdiste el acceso a las ventanas
        hasta que la reactives. Tu cuenta y tus datos siguen acá.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Boton
          onClick={() => reactivar.ejecutar(async () => (irAlPago(await iniciarSuscripcion(), navegar), null))}
          disabled={reactivar.pendiente}
          aria-busy={reactivar.pendiente}
        >
          {reactivar.pendiente ? 'Te llevamos a Mercado Pago…' : 'Reactivar mi suscripción'}
        </Boton>
        <Boton
          variante="secundario"
          onClick={() => tarjeta.ejecutar(async () => (irAlPago(await cambiarMedioDePago(), navegar), null))}
          disabled={tarjeta.pendiente}
        >
          Cambiar el medio de pago
        </Boton>
      </div>
      {(reactivar.error || tarjeta.error) && <Aviso className="mt-4">{reactivar.error ?? tarjeta.error}</Aviso>}
    </TarjetaSuscripcion>
  )
}
