import type { Suscripcion } from '../../datos/tipos'
import Boton from '../base/Boton'
import Tarjeta from '../base/Tarjeta'
import PlanParaSuscribirse from './PlanParaSuscribirse'
import SuscripcionActiva from './SuscripcionActiva'
import SuscripcionCancelada from './SuscripcionCancelada'
import SuscripcionEnGracia from './SuscripcionEnGracia'
import SuscripcionPendiente from './SuscripcionPendiente'
import SuscripcionVencida from './SuscripcionVencida'

type Props = { suscripcion: Suscripcion | null; avisar: (texto: string) => void }

// Elige qué mostrar según el estado de la suscripción. Es exhaustivo a propósito: al sumar un
// estado en el tipo, el compilador obliga a decidir cómo se ve.
export default function EstadoSuscripcion({ suscripcion, avisar }: Props) {
  if (!suscripcion) return <PlanParaSuscribirse />

  switch (suscripcion.estado) {
    case 'administradora':
      return (
        <Tarjeta className="p-6">
          <h2 className="mb-2 text-titulo-s font-normal">Acceso de administradora</h2>
          <p className="mb-4 text-cuerpo text-mar-tintaSuave">
            Tu cuenta tiene acceso completo al contenido y al panel del sitio.
          </p>
          <Boton to="/admin" variante="secundario">
            Ir al panel
          </Boton>
        </Tarjeta>
      )
    case 'activa':
      return <SuscripcionActiva suscripcion={suscripcion} avisar={avisar} />
    case 'en_gracia':
      return <SuscripcionEnGracia suscripcion={suscripcion} />
    case 'cancelada':
      return <SuscripcionCancelada suscripcion={suscripcion} avisar={avisar} />
    case 'pendiente':
      return <SuscripcionPendiente />
    case 'vencida':
      return <SuscripcionVencida suscripcion={suscripcion} />
  }
}
