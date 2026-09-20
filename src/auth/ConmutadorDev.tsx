// SOLO DESARROLLO — se borra cuando entra Supabase Auth.
// Cambia entre los tres roles simulados para revisar cada pantalla sin backend.
import type { Rol } from '../datos/tipos'
import { useSesionDev } from './SesionContext'

const siguiente: Record<Rol, Rol> = {
  visitante: 'suscriptora',
  suscriptora: 'admin',
  admin: 'visitante',
}

export default function ConmutadorDev() {
  return import.meta.env.DEV ? <Conmutador /> : null
}

function Conmutador() {
  const { rol, cambiarRol } = useSesionDev()

  return (
    <button
      type="button"
      onClick={() => cambiarRol(siguiente[rol])}
      aria-label={`Rol simulado: ${rol}. Tocá para cambiarlo`}
      className="fixed bottom-4 right-4 z-[60] min-h-[44px] rounded-full border border-mar-bordeAgua bg-mar-blanco px-4 text-sm text-mar-tinta shadow-sm"
    >
      Rol: <strong className="font-bold">{rol}</strong>
    </button>
  )
}
