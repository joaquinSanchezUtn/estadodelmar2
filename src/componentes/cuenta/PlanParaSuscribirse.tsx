import { useNavigate } from 'react-router-dom'
import { iniciarSuscripcion } from '../../datos/contenido'
import { useAccion } from '../../lib/useAccion'
import { usePlan } from '../../lib/usePrecio'
import PrecioDelPlan from '../base/PrecioDelPlan'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import ListaIncluye from '../base/ListaIncluye'
import TarjetaSuscripcion from './TarjetaSuscripcion'
import { irAlPago } from './irAlPago'

// La sección de Mi cuenta desde donde se activa la suscripción: es el único lugar donde se ofrece.
export default function PlanParaSuscribirse() {
  const navegar = useNavigate()
  const { pendiente, error, ejecutar } = useAccion()
  const plan = usePlan()

  const suscribirme = () =>
    ejecutar(async () => {
      irAlPago(await iniciarSuscripcion(), navegar)
      return null
    })

  return (
    <TarjetaSuscripcion sello={{ tono: 'coral', texto: 'Sin suscripción' }}>
      <p className="mb-5 text-cuerpo text-mar-tintaSuave">
        Con un solo plan accedés a todos los temas y a los que se vayan sumando.
      </p>

      <div className="mb-5 rounded-tarjeta border border-mar-bordeAgua bg-mar-arena p-5 text-center">
        <p className="mb-2 text-etiqueta uppercase text-mar-agua">Plan mensual</p>
        <PrecioDelPlan plan={plan} tamano="medio" />
        <p className="mt-1 text-meta text-mar-tintaSuave">Se renueva solo · cancelás cuando quieras</p>
        {plan.descuento && <p className="mt-1 text-meta text-mar-tintaSuave">El descuento es para quien se suscribe por primera vez.</p>}
      </div>

      <ListaIncluye className="mb-6" />

      <Boton onClick={suscribirme} disabled={pendiente} aria-busy={pendiente} className="w-full sm:w-auto">
        {pendiente ? 'Te llevamos a Mercado Pago…' : 'Suscribirme'}
      </Boton>
      <p className="mt-3 text-meta text-mar-tintaSuave">El pago se hace en Mercado Pago.</p>
      {error && <Aviso className="mt-4">{error}</Aviso>}
    </TarjetaSuscripcion>
  )
}
