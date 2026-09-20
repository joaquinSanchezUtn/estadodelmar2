import { Navigate, Outlet } from 'react-router-dom'
import { useSesion } from './SesionContext'

// Solo experiencia de usuario: redirige a quien no tiene sesión.
// No protege ningún dato; la protección real vive en las políticas RLS de la base.
export default function ProtectedRoute() {
  const { rol, cargando } = useSesion()

  if (cargando) return <p className="p-4">Cargando…</p>
  if (rol === 'visitante') return <Navigate to="/ingresar" replace />
  return <Outlet />
}
