// SOLO DESARROLLO. El rol ya es real (viene de Supabase): para probarlo como admin o como
// suscriptora hay que promoverse de verdad en la base (ver el comentario de la migración 0001) o
// cargar una suscripción a mano. Lo único que queda simulado acá es el estado de la suscripción que
// se ve en Mi cuenta (activa, cancelada, pendiente, vencida): esa tabla todavía es un mock, hasta
// que la Tanda de datos la conecte a la real.
import { enDias, fijarSuscripcionSimulada, suscripcionSimulada } from '../datos/suscripcionSimulada'
import type { Suscripcion } from '../datos/tipos'
import { useSesion } from './SesionContext'

// Recorre los cinco estados posibles de la suscripción de quien está logueada.
const estados: (Suscripcion | null)[] = [
  null,
  { estado: 'activa', proximoCobro: enDias(16), medioDePago: 'Visa terminada en 4242' },
  { estado: 'cancelada', accesoHasta: enDias(16) },
  { estado: 'pendiente' },
  { estado: 'vencida', desde: enDias(-3) },
]
const nombre = (s: Suscripcion | null) => s?.estado ?? 'ninguna'

export default function ConmutadorDev() {
  return import.meta.env.DEV ? <Conmutador /> : null
}

function Conmutador() {
  const { usuario, rol, refrescarSesion } = useSesion()
  if (!usuario || rol === 'admin') return null

  const cambiarSuscripcion = async () => {
    const i = estados.findIndex((e) => nombre(e) === nombre(suscripcionSimulada()))
    fijarSuscripcionSimulada(estados[(i + 1) % estados.length])
    await refrescarSesion()
  }

  return (
    <button
      type="button"
      onClick={cambiarSuscripcion}
      aria-label={`Suscripción simulada: ${nombre(suscripcionSimulada())}. Tocá para cambiarla`}
      className="fixed bottom-4 right-4 z-flotante min-h-control-sm rounded-full border border-mar-bordeControl bg-mar-blanco px-4 text-meta text-mar-tinta shadow-sm"
    >
      Suscripción: <strong className="font-bold">{nombre(suscripcionSimulada())}</strong>
    </button>
  )
}
