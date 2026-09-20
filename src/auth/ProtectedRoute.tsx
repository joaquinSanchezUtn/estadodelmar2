import { Navigate, Outlet } from 'react-router-dom'
import { useSesion } from './useSesion'

// Solo experiencia de usuario: redirige a quien no tiene sesión.
// No protege ningún dato; eso lo hace RLS en la base.
export default function ProtectedRoute() {
  const { sesion, cargando } = useSesion()

  if (cargando) return <p className="p-4">Cargando…</p>
  if (!sesion) return <Navigate to="/ingresar" replace />
  return <Outlet />
}
