import { useEffect, useRef } from 'react'
import Boton from '../base/Boton'

type Props = { onCancelar: () => void; onConfirmar: () => void }

// Confirmación en la misma página (nunca un confirm() del navegador).
// Al abrirse lleva el foco al título; con Escape se cancela.
export default function ConfirmarBaja({ onCancelar, onConfirmar }: Props) {
  const titulo = useRef<HTMLHeadingElement>(null)

  useEffect(() => titulo.current?.focus(), [])

  return (
    <div
      id="confirmar-baja"
      role="alertdialog"
      aria-labelledby="baja-titulo"
      aria-describedby="baja-texto"
      onKeyDown={(e) => e.key === 'Escape' && onCancelar()}
      className="mt-5 rounded-xl border border-mar-bordeCielo bg-mar-aguaClara p-5"
    >
      <h3 id="baja-titulo" ref={titulo} tabIndex={-1} className="mb-2 text-lg font-normal">
        ¿Querés darte de baja?
      </h3>
      <p id="baja-texto" className="text-base leading-relaxed text-mar-tintaSuave">
        Vas a seguir teniendo acceso hasta que termine el mes pago. Después, la suscripción no
        se renueva.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Boton onClick={onConfirmar}>Sí, darme de baja</Boton>
        <Boton variante="secundario" onClick={onCancelar}>
          No, mantener mi suscripción
        </Boton>
      </div>
    </div>
  )
}
