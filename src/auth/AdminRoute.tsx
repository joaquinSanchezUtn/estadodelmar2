import { Navigate, Outlet } from 'react-router-dom'
import { useSesion } from './useSesion'

// Solo experiencia de usuario: oculta el panel a quien no es admin.
// La protección real de la escritura vive en las policies de RLS.
export default function AdminRoute() {
  const { sesion, esAdmin, cargando } = useSesion()

  if (cargando) return <p className="p-4">Cargando…</p>
  if (!sesion) return <Navigate to="/ingresar" replace />
  if (!esAdmin) return <Navigate to="/" replace />
  return <Outlet />
}
