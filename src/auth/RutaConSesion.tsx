import { Navigate, Outlet } from 'react-router-dom'
import { useSesion } from './SesionContext'

// Solo experiencia de usuario: redirige a quien no tiene sesión.
// No protege ningún dato: la protección real vive en las políticas RLS de la base.
// Pasa solo quien tiene usuario; así un rol nuevo no entra por omisión.
export default function RutaConSesion() {
  const { usuario, cargando } = useSesion()

  if (cargando) return <p role="status" className="p-6 text-mar-tintaSuave">Cargando…</p>
  if (!usuario) return <Navigate to="/ingresar" replace />
  return <Outlet />
}
