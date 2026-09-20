import { useSesion } from '../../auth/SesionContext'
import { reactivarSuscripcion } from '../../datos/contenido'
import type { Suscripcion } from '../../datos/tipos'
import { fechaLarga } from '../../lib/formato'
import { useAccion } from '../../lib/useAccion'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import TarjetaSuscripcion from './TarjetaSuscripcion'

type Props = { suscripcion: Extract<Suscripcion, { estado: 'cancelada' }>; avisar: (texto: string) => void }

// Dio de baja pero el período pago sigue vigente: todavía tiene acceso y puede arrepentirse sin pagar de nuevo.
export default function SuscripcionCancelada({ suscripcion, avisar }: Props) {
  const { refrescarSesion } = useSesion()
  const { pendiente, error, ejecutar } = useAccion()

  const reactivar = () =>
    ejecutar(async () => {
      const r = await reactivarSuscripcion()
      if (!r.ok) return r.mensaje
      await refrescarSesion()
      avisar('Reactivamos tu suscripción. Se renueva sola, como antes.')
      return null
    })

  return (
    <TarjetaSuscripcion sello={{ tono: 'neutro', texto: 'Cancelada' }}>
      <p className="mb-5 text-cuerpo text-mar-tintaSuave">
        Cancelaste tu suscripción. Seguís teniendo acceso a todas las ventanas hasta el{' '}
        <strong className="font-medium text-mar-tinta">{fechaLarga(suscripcion.accesoHasta)}</strong>. Después no se
        renueva y no se te cobra.
      </p>
      <Boton onClick={reactivar} disabled={pendiente} aria-busy={pendiente}>
        {pendiente ? 'Reactivando…' : 'Reactivar mi suscripción'}
      </Boton>
      {error && <Aviso className="mt-4">{error}</Aviso>}
    </TarjetaSuscripcion>
  )
}
