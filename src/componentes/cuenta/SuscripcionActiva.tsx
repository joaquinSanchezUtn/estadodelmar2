import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSesion } from '../../auth/SesionContext'
import { cambiarMedioDePago, cancelarSuscripcion } from '../../datos/contenido'
import type { Suscripcion } from '../../datos/tipos'
import { fechaLarga } from '../../lib/formato'
import { useAccion } from '../../lib/useAccion'
import { usePrecio } from '../../lib/usePrecio'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import ConfirmarBaja from './ConfirmarBaja'
import TarjetaSuscripcion from './TarjetaSuscripcion'
import { irAlPago } from './irAlPago'

type Props = { suscripcion: Extract<Suscripcion, { estado: 'activa' }>; avisar: (texto: string) => void }

export default function SuscripcionActiva({ suscripcion, avisar }: Props) {
  const { refrescarSesion } = useSesion()
  const navegar = useNavigate()
  const [confirmando, setConfirmando] = useState(false)
  const botonBaja = useRef<HTMLButtonElement>(null)
  const baja = useAccion()
  const tarjeta = useAccion()
  const precio = usePrecio()

  // Cerrar la confirmación devuelve el foco al botón que la abrió.
  const cerrar = () => {
    setConfirmando(false)
    botonBaja.current?.focus()
  }

  const darDeBaja = () =>
    baja.ejecutar(async () => {
      const r = await cancelarSuscripcion()
      if (!r.ok) return r.mensaje
      await refrescarSesion()
      avisar(`Listo, cancelamos tu suscripción. Seguís teniendo acceso hasta el ${fechaLarga(r.accesoHasta)}.`)
      return null
    })

  const cambiarTarjeta = () =>
    tarjeta.ejecutar(async () => {
      irAlPago(await cambiarMedioDePago(), navegar)
      return null
    })

  return (
    <TarjetaSuscripcion sello={{ tono: 'agua', texto: 'Activa' }}>
      <dl className="flex flex-col gap-1 sm:grid sm:grid-cols-[140px_1fr] sm:gap-x-4 sm:gap-y-3">
        <dt className="text-cuerpo text-mar-tintaSuave">Plan</dt>
        <dd className="mb-2 text-cuerpo text-mar-tinta sm:mb-0">Mensual · {precio} por mes</dd>
        <dt className="text-cuerpo text-mar-tintaSuave">Próximo cobro</dt>
        <dd className="mb-2 text-cuerpo text-mar-tinta sm:mb-0">{fechaLarga(suscripcion.proximoCobro)}</dd>
        <dt className="text-cuerpo text-mar-tintaSuave">Medio de pago</dt>
        <dd className="text-cuerpo text-mar-tinta">{suscripcion.medioDePago}</dd>
      </dl>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Boton variante="secundario" onClick={cambiarTarjeta} disabled={tarjeta.pendiente}>
          Cambiar el medio de pago
        </Boton>
        <Boton
          ref={botonBaja}
          variante="fantasma"
          aria-expanded={confirmando}
          aria-controls="confirmar-baja"
          onClick={() => setConfirmando(true)}
        >
          Darme de baja
        </Boton>
      </div>
      {tarjeta.error && <Aviso className="mt-4">{tarjeta.error}</Aviso>}
      {confirmando && (
        <ConfirmarBaja
          hasta={suscripcion.proximoCobro}
          pendiente={baja.pendiente}
          error={baja.error}
          onCancelar={cerrar}
          onConfirmar={darDeBaja}
        />
      )}
    </TarjetaSuscripcion>
  )
}
