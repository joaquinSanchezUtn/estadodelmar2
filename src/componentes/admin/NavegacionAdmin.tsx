import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'

const enlaces = [
  { to: '/admin', texto: 'Resumen', fin: true },
  { to: '/admin/ventanas', texto: 'Ventanas', fin: false },
  { to: '/admin/quien-soy', texto: 'Quién soy', fin: false },
]

// Las secciones del panel. NavLink marca la activa con aria-current="page".
export default function NavegacionAdmin() {
  return (
    <nav aria-label="Panel de administración" className="flex gap-2">
      {enlaces.map((e) => (
        <NavLink
          key={e.to}
          to={e.to}
          end={e.fin}
          className={({ isActive }) =>
            cn(
              'inline-flex min-h-control-sm items-center rounded-full border px-5 text-cuerpo no-underline transition-colors',
              isActive ? 'border-mar-celesteBorde bg-mar-celeste font-medium text-mar-tintaBoton' : 'border-mar-bordeControl bg-mar-blanco/60 text-mar-tinta hover:bg-mar-blanco',
            )
          }
        >
          {e.texto}
        </NavLink>
      ))}
    </nav>
  )
}
