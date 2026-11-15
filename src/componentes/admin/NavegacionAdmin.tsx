import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'

const enlaces = [
  { to: '/admin/portada', texto: 'Portada' },
  { to: '/admin/como-funciona', texto: 'Cómo funciona' },
  { to: '/admin/estados', texto: 'Ventanas' },
  { to: '/admin/ventanas', texto: 'Temas' },
  { to: '/admin/quien-soy', texto: 'Quién soy' },
  { to: '/admin/mensajes', texto: 'Mensajes' },
  { to: '/admin/semillas', texto: 'Semillas del mar' },
  { to: '/admin/ecos', texto: 'Ecos del océano' },
]

// Las secciones del panel. NavLink marca la activa con aria-current="page".
export default function NavegacionAdmin() {
  return (
    <nav aria-label="Panel de administración" className="flex flex-wrap gap-2">
      {enlaces.map((e) => (
        <NavLink
          key={e.to}
          to={e.to}
          className={({ isActive }) =>
            cn(
              'inline-flex min-h-control-sm items-center rounded-full border px-5 text-cuerpo no-underline transition-colors',
              isActive ? 'border-mar-primario bg-mar-primarioSuave font-bold text-mar-primario' : 'border-mar-bordeControl bg-mar-blanco text-mar-tinta hover:bg-mar-primarioSuave',
            )
          }
        >
          {e.texto}
        </NavLink>
      ))}
    </nav>
  )
}
