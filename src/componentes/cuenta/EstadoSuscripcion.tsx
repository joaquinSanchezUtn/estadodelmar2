import { useRef, useState } from 'react'
import type { Suscripcion } from '../../datos/tipos'
import { fechaLarga } from '../../lib/formato'
import Boton from '../base/Boton'
import Sello from '../base/Sello'
import Tarjeta from '../base/Tarjeta'
import ConfirmarBaja from './ConfirmarBaja'

type Props = { suscripcion: Suscripcion | null; esAdmin: boolean }

export default function EstadoSuscripcion({ suscripcion, esAdmin }: Props) {
  const [confirmando, setConfirmando] = useState(false)
  const botonBaja = useRef<HTMLButtonElement>(null)

  // Cerrar la confirmación devuelve el foco al botón que la abrió.
  const cerrar = () => {
    setConfirmando(false)
    botonBaja.current?.focus()
  }

  if (esAdmin) {
    return (
      <Tarjeta className="p-6">
        <h2 className="mb-2 text-xl font-normal">Acceso de administradora</h2>
        <p className="mb-4 text-base leading-relaxed text-mar-tintaSuave">
          Tu cuenta tiene acceso completo al contenido y al panel del sitio.
        </p>
        <Boton to="/admin" variante="secundario">
          Ir al panel
        </Boton>
      </Tarjeta>
    )
  }

  if (!suscripcion) {
    return (
      <Tarjeta className="p-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-xl font-normal">Tu suscripción</h2>
          <Sello tono="coral">Sin suscripción</Sello>
        </div>
        <p className="mb-4 text-base leading-relaxed text-mar-tintaSuave">
          Todavía no tenés una suscripción activa. Con un solo plan accedés a todas las ventanas.
        </p>
        <Boton to="/#suscripcion">Ver el plan</Boton>
      </Tarjeta>
    )
  }

  return (
    <Tarjeta className="p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-normal">Tu suscripción</h2>
        <Sello tono="agua">Activa</Sello>
      </div>
      <dl className="flex flex-col gap-1 sm:grid sm:grid-cols-[140px_1fr] sm:gap-x-4 sm:gap-y-3">
        <dt className="text-[15px] text-mar-tintaSuave">Plan</dt>
        <dd className="mb-2 text-base text-mar-tinta sm:mb-0">Mensual · [PRECIO] por mes</dd>
        <dt className="text-[15px] text-mar-tintaSuave">Próximo cobro</dt>
        <dd className="text-base text-mar-tinta">{fechaLarga(suscripcion.proximoCobro)}</dd>
      </dl>
      <Boton
        ref={botonBaja}
        variante="secundario"
        aria-expanded={confirmando}
        aria-controls="confirmar-baja"
        onClick={() => setConfirmando(true)}
        className="mt-5"
      >
        Darme de baja
      </Boton>
      {/* Pendiente: la baja real se hace con Mercado Pago. Por ahora solo cierra la confirmación. */}
      {confirmando && <ConfirmarBaja onCancelar={cerrar} onConfirmar={cerrar} />}
    </Tarjeta>
  )
}
