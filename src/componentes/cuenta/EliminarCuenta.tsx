import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSesion } from '../../auth/SesionContext'
import { mensajeDeError } from '../../auth/mensajes'
import type { Suscripcion } from '../../datos/tipos'
import { useAccion } from '../../lib/useAccion'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import Tarjeta from '../base/Tarjeta'

const PALABRA = 'ELIMINAR'

// La acción que no se deshace: se pide escribir una palabra y se explica qué pasa con la suscripción.
export default function EliminarCuenta({ suscripcion }: { suscripcion: Suscripcion | null }) {
  const { eliminarCuenta } = useSesion()
  const navegar = useNavigate()
  const [confirmando, setConfirmando] = useState(false)
  const [escrito, setEscrito] = useState('')
  const { pendiente, error, ejecutar } = useAccion()
  const boton = useRef<HTMLButtonElement>(null)
  const titulo = useRef<HTMLHeadingElement>(null)
  // Cualquier suscripción distinta de ninguna: una vencida puede seguir cobrando desde Mercado Pago (pausada, con reintentos).
  const conSuscripcion = suscripcion !== null && suscripcion.estado !== 'administradora'

  useEffect(() => {
    if (confirmando) titulo.current?.focus()
  }, [confirmando])

  const cerrar = () => {
    setConfirmando(false)
    setEscrito('')
    setTimeout(() => boton.current?.focus())
  }

  const eliminar = async () => {
    const ok = await ejecutar(async () => {
      const r = await eliminarCuenta()
      return r.ok ? null : mensajeDeError[r.error]
    })
    // La pantalla de despedida es la que suelta la sesión local.
    if (ok) navegar('/cuenta-eliminada', { replace: true })
  }

  return (
    <Tarjeta className="p-6">
      <h2 className="mb-2 text-titulo-s font-normal">Eliminar mi cuenta</h2>
      <p className="mb-5 text-cuerpo text-mar-tintaSuave">
        Se borran tu cuenta y tus datos. No se puede deshacer.
        {conSuscripcion && ' También cancelamos tu suscripción y no se te vuelve a cobrar.'}
      </p>
      <Boton
        ref={boton}
        compacto
        variante="secundario"
        aria-expanded={confirmando}
        aria-controls="confirmar-eliminar"
        onClick={() => setConfirmando(true)}
      >
        Eliminar mi cuenta
      </Boton>

      {confirmando && (
        <div
          id="confirmar-eliminar"
          role="alertdialog"
          aria-labelledby="eliminar-titulo"
          onKeyDown={(e) => e.key === 'Escape' && !pendiente && cerrar()}
          className="mt-5 rounded-tarjeta border border-mar-coral/60 bg-mar-blanco p-5"
        >
          <h3 id="eliminar-titulo" ref={titulo} tabIndex={-1} className="mb-2 text-titulo-s font-normal">
            ¿Seguro que querés eliminar tu cuenta?
          </h3>
          <label htmlFor="palabra-eliminar" className="mb-2 block text-cuerpo text-mar-tintaSuave">
            Para confirmar, escribí <strong className="font-medium text-mar-tinta">{PALABRA}</strong>.
          </label>
          <input
            id="palabra-eliminar"
            value={escrito}
            onChange={(e) => setEscrito(e.target.value)}
            autoComplete="off"
            className="min-h-control w-full rounded-control border border-mar-bordeControl bg-mar-blanco px-4 text-cuerpo text-mar-tinta"
          />
          {error && <Aviso className="mt-4">{error}</Aviso>}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Boton onClick={eliminar} disabled={pendiente || escrito.trim().toUpperCase() !== PALABRA} aria-busy={pendiente}>
              {pendiente ? 'Eliminando…' : 'Eliminar definitivamente'}
            </Boton>
            <Boton variante="secundario" onClick={cerrar} disabled={pendiente}>
              No, conservar mi cuenta
            </Boton>
          </div>
        </div>
      )}
    </Tarjeta>
  )
}
