import { Link } from 'react-router-dom'
import Tarjeta from '../base/Tarjeta'

// Mientras no exista la Edge Function que da de baja una cuenta (cancelar en Mercado Pago, cerrar las
// sesiones y recién ahí borrar: ver CLAUDE.md), la baja se pide por contacto. `EliminarCuenta` es la
// versión con la baja directa, para cuando esa función esté: ofrecerla antes terminaba en un error.
export default function PedirBajaDeCuenta() {
  return (
    <Tarjeta className="p-6 shadow-suave">
      <h2 className="mb-2 text-titulo-s font-normal">Eliminar mi cuenta</h2>
      <p className="text-cuerpo text-mar-tintaSuave">
        Por ahora la baja se hace a pedido. Escribinos desde{' '}
        <Link to="/contacto" className="font-bold text-mar-primario">
          Contacto
        </Link>{' '}
        eligiendo «Mis datos personales»: borramos tu cuenta y tus datos, y si tenés una suscripción la cancelamos para que no se te vuelva a cobrar.
      </p>
    </Tarjeta>
  )
}
