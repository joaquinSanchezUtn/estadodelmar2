import { useEffect, useRef } from 'react'
import { fechaLarga } from '../../lib/formato'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'

type Props = { hasta: string; pendiente: boolean; error: string | null; onCancelar: () => void; onConfirmar: () => void }

// Confirmación en la misma página (nunca un confirm() del navegador).
// Al abrirse lleva el foco al título; con Escape se cancela.
export default function ConfirmarBaja({ hasta, pendiente, error, onCancelar, onConfirmar }: Props) {
  const titulo = useRef<HTMLHeadingElement>(null)

  useEffect(() => titulo.current?.focus(), [])

  return (
    <div
      id="confirmar-baja"
      role="alertdialog"
      aria-labelledby="baja-titulo"
      aria-describedby="baja-texto"
      onKeyDown={(e) => e.key === 'Escape' && !pendiente && onCancelar()}
      className="mt-5 rounded-tarjeta border border-mar-bordeCielo bg-mar-aguaClara p-5"
    >
      <h3 id="baja-titulo" ref={titulo} tabIndex={-1} className="mb-2 text-titulo-s font-normal">
        ¿Querés darte de baja?
      </h3>
      <p id="baja-texto" className="text-cuerpo text-mar-tintaSuave">
        Vas a seguir teniendo acceso hasta el {fechaLarga(hasta)}. Después, la suscripción no se renueva y no
        se te vuelve a cobrar.
      </p>
      {error && <Aviso className="mt-4">{error}</Aviso>}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Boton onClick={onConfirmar} disabled={pendiente} aria-busy={pendiente}>
          {pendiente ? 'Dándote de baja…' : 'Sí, darme de baja'}
        </Boton>
        <Boton variante="secundario" onClick={onCancelar} disabled={pendiente}>
          No, mantener mi suscripción
        </Boton>
      </div>
    </div>
  )
}
