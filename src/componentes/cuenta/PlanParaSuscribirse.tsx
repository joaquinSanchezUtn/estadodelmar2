import { useNavigate } from 'react-router-dom'
import { iniciarSuscripcion } from '../../datos/contenido'
import { useAccion } from '../../lib/useAccion'
import { usePrecio } from '../../lib/usePrecio'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import TarjetaSuscripcion from './TarjetaSuscripcion'
import { irAlPago } from './irAlPago'

// La sección de Mi cuenta desde donde se activa la suscripción: es el único lugar donde se ofrece.
export default function PlanParaSuscribirse() {
  const navegar = useNavigate()
  const { pendiente, error, ejecutar } = useAccion()
  const precio = usePrecio()

  const suscribirme = () =>
    ejecutar(async () => {
      irAlPago(await iniciarSuscripcion(), navegar)
      return null
    })

  return (
    <TarjetaSuscripcion sello={{ tono: 'coral', texto: 'Sin suscripción' }}>
      <p className="mb-5 text-cuerpo text-mar-tintaSuave">
        Con un solo plan accedés a todas las ventanas y a las que se vayan sumando.
      </p>

      <div className="mb-5 rounded-tarjeta border border-mar-bordeAgua bg-mar-espuma p-5 text-center">
        <p className="mb-2 text-etiqueta uppercase text-mar-agua">Plan mensual</p>
        <p className="font-titulo text-titulo-l font-light">{precio}</p>
        <p className="mt-1 text-meta text-mar-tintaSuave">por mes · se renueva solo · cancelás cuando quieras</p>
      </div>

      <Boton onClick={suscribirme} disabled={pendiente} aria-busy={pendiente} className="w-full sm:w-auto">
        {pendiente ? 'Te llevamos a Mercado Pago…' : 'Suscribirme'}
      </Boton>
      <p className="mt-3 text-meta text-mar-tintaSuave">El pago se hace en Mercado Pago.</p>
      {error && <Aviso className="mt-4">{error}</Aviso>}
    </TarjetaSuscripcion>
  )
}
