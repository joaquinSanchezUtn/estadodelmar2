import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSesion } from './SesionContext'

// Solo experiencia de usuario: oculta el panel a quien no es admin.
// La protección real vive en las políticas RLS de la base, que son las que
// impiden leer borradores o escribir contenido a cualquiera que no sea admin.
export default function RutaDeAdmin() {
  const { usuario, rol, enRecuperacion, cargando } = useSesion()

  const { pathname, search } = useLocation()

  if (cargando) return <p role="status" className="p-6 text-mar-tintaSuave">Cargando…</p>
  if (enRecuperacion) return <Navigate to="/nueva-contrasena" replace />
  if (!usuario) return <Navigate to="/ingresar" replace state={{ desde: pathname + search }} />
  if (rol !== 'admin') return <Navigate to="/" replace />
  return <Outlet />
}
