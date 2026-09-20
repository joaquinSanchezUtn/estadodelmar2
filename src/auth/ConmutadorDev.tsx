// SOLO DESARROLLO — se borra cuando entra Supabase Auth.
// Cambia entre los roles simulados y entre los estados de suscripción para revisar cada pantalla sin backend.
import { useState } from 'react'
import { enDias, fijarSuscripcionSimulada, suscripcionSimulada } from '../datos/suscripcionSimulada'
import type { Rol, Suscripcion } from '../datos/tipos'
import { useSesion, useSesionDev } from './SesionContext'

const siguiente: Record<Rol, Rol> = {
  visitante: 'registrada',
  registrada: 'suscriptora',
  suscriptora: 'admin',
  admin: 'visitante',
}

// Recorre los cinco estados posibles de la suscripción de quien está logueada.
const estados: (Suscripcion | null)[] = [
  null,
  { estado: 'activa', proximoCobro: enDias(16), medioDePago: 'Visa terminada en 4242' },
  { estado: 'cancelada', accesoHasta: enDias(16) },
  { estado: 'pendiente' },
  { estado: 'vencida', desde: enDias(-3) },
]
const nombre = (s: Suscripcion | null) => s?.estado ?? 'ninguna'

const boton =
  'min-h-control-sm rounded-full border border-mar-bordeAgua bg-mar-blanco px-4 text-meta text-mar-tinta shadow-sm'

export default function ConmutadorDev() {
  return import.meta.env.DEV ? <Conmutador /> : null
}

function Conmutador() {
  const { rol, cambiarRol, vencerSesion } = useSesionDev()
  const { usuario, refrescarSesion } = useSesion()
  const [, redibujar] = useState(0)

  const cambiarSuscripcion = async () => {
    const i = estados.findIndex((e) => nombre(e) === nombre(suscripcionSimulada()))
    fijarSuscripcionSimulada(estados[(i + 1) % estados.length])
    await refrescarSesion()
    redibujar((n) => n + 1)
  }

  return (
    <div className="fixed bottom-4 right-4 z-flotante flex flex-col items-end gap-2">
      {usuario && rol !== 'admin' && (
        <button type="button" onClick={cambiarSuscripcion} aria-label={`Suscripción simulada: ${nombre(suscripcionSimulada())}. Tocá para cambiarla`} className={boton}>
          Suscripción: <strong className="font-bold">{nombre(suscripcionSimulada())}</strong>
        </button>
      )}
      {usuario && (
        <button type="button" onClick={vencerSesion} className={boton}>
          Vencer la sesión
        </button>
      )}
      <button type="button" onClick={() => cambiarRol(siguiente[rol])} aria-label={`Rol simulado: ${rol}. Tocá para cambiarlo`} className={boton}>
        Rol: <strong className="font-bold">{rol}</strong>
      </button>
    </div>
  )
}
