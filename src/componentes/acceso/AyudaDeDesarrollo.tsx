// SOLO DESARROLLO — no se renderiza (ni se incluye) en producción. Atajos para probar el acceso
// sin backend: las cuentas de ejemplo y el "clic" en el enlace de un correo que no se manda.
import { Link } from 'react-router-dom'
import { CONTRASENA_DE_PRUEBA } from '../../datos/cuentasSimuladas'
import type { TipoRetorno } from '../../auth/tipos'

const caja = 'mt-6 rounded-tarjeta border border-dashed border-mar-bordeAgua bg-mar-nube p-4 text-meta text-mar-tintaSuave'

export function CuentasDePrueba() {
  if (!import.meta.env.DEV) return null
  return (
    <div className={caja}>
      <p className="mb-1 font-medium text-mar-tinta">Solo en desarrollo · cuentas de ejemplo</p>
      <p>sofia@ejemplo.com (registrada) · lucia@ejemplo.com (suscriptora) · mariana@ejemplo.com (admin)</p>
      <p>Contraseña: {CONTRASENA_DE_PRUEBA}</p>
    </div>
  )
}

export function SimularCorreo({ tipo }: { tipo: TipoRetorno }) {
  if (!import.meta.env.DEV) return null
  return (
    <div className={caja}>
      <p className="mb-1">Solo en desarrollo: no se manda ningún correo.</p>
      <Link to={`/auth/callback?tipo=${tipo}`} className="inline-flex min-h-control-sm items-center underline">
        Simular el clic en el enlace del correo
      </Link>
    </div>
  )
}
