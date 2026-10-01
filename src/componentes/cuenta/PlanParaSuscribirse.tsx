import { useNavigate } from 'react-router-dom'
import { iniciarSuscripcion } from '../../datos/contenido'
import { useAccion } from '../../lib/useAccion'
import { usePrecio } from '../../lib/usePrecio'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import TarjetaSuscripcion from './TarjetaSuscripcion'
import { irAlPago } from './irAlPago'

// Lo que trae el plan: solo lo que el sitio ya hace, nada prometido de más.
const incluye = [
  'Todos los temas, y los que se vayan sumando.',
  'En cada tema: un video, una meditación guiada y una ejercitación.',
  'A tu ritmo, desde el celular o la compu.',
]

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
        Con un solo plan accedés a todos los temas y a los que se vayan sumando.
      </p>

      <div className="mb-5 rounded-tarjeta border border-mar-bordeAgua bg-mar-arena p-5 text-center">
        <p className="mb-2 text-etiqueta uppercase text-mar-agua">Plan mensual</p>
        <p className="font-titulo text-titulo-l font-light">{precio}</p>
        <p className="mt-1 text-meta text-mar-tintaSuave">por mes · se renueva solo · cancelás cuando quieras</p>
      </div>

      <ul className="mb-6 flex flex-col gap-2">
        {incluye.map((t) => (
          <li key={t} className="flex items-start gap-3 text-cuerpo text-mar-tinta">
            <span aria-hidden="true" className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-mar-primarioSuave text-meta font-bold text-mar-primario">
              ✓
            </span>
            {t}
          </li>
        ))}
      </ul>

      <Boton onClick={suscribirme} disabled={pendiente} aria-busy={pendiente} className="w-full sm:w-auto">
        {pendiente ? 'Te llevamos a Mercado Pago…' : 'Suscribirme'}
      </Boton>
      <p className="mt-3 text-meta text-mar-tintaSuave">El pago se hace en Mercado Pago.</p>
      {error && <Aviso className="mt-4">{error}</Aviso>}
    </TarjetaSuscripcion>
  )
}
