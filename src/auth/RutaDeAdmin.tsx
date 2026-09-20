import { Navigate, Outlet } from 'react-router-dom'
import { useSesion } from './SesionContext'

// Solo experiencia de usuario: oculta el panel a quien no es admin.
// La protección real vive en las políticas RLS de la base, que son las que
// impiden leer borradores o escribir contenido a cualquiera que no sea admin.
export default function RutaDeAdmin() {
  const { usuario, rol, cargando } = useSesion()

  if (cargando) return <p role="status" className="p-6 text-mar-tintaSuave">Cargando…</p>
  if (!usuario) return <Navigate to="/ingresar" replace />
  if (rol !== 'admin') return <Navigate to="/" replace />
  return <Outlet />
}
