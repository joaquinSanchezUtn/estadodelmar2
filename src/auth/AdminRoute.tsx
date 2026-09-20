import { Navigate, Outlet } from 'react-router-dom'
import { useSesion } from './SesionContext'

// Solo experiencia de usuario: oculta el panel a quien no es admin.
// La protección real vive en las políticas RLS de la base, que son las que
// impiden escribir contenido a cualquiera que no sea admin.
export default function AdminRoute() {
  const { rol, cargando } = useSesion()

  if (cargando) return <p className="p-4">Cargando…</p>
  if (rol === 'visitante') return <Navigate to="/ingresar" replace />
  if (rol !== 'admin') return <Navigate to="/" replace />
  return <Outlet />
}
