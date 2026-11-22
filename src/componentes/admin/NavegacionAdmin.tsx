import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { secciones } from './seccionesDelPanel'

const inicio = { to: '/admin', titulo: 'Inicio', icono: '⌂', rutas: [] as string[] }

// Las secciones del panel: Inicio y las cuatro puertas. Una sección queda marcada también cuando se está en
// una pantalla de adentro (por ejemplo, un tema marca «Ventanas y temas»).
export default function NavegacionAdmin() {
  const { pathname } = useLocation()
  const activa = (rutas: string[], to: string) => (rutas.length ? rutas.some((r) => pathname === r || pathname.startsWith(`${r}/`)) : pathname === to)

  return (
    <nav aria-label="Panel de administración" className="flex flex-wrap gap-2">
      {[inicio, ...secciones].map((s) => {
        const marcada = activa(s.rutas, s.to)
        return (
          <Link
            key={s.to}
            to={s.to}
            aria-current={marcada ? 'page' : undefined}
            className={cn(
              'inline-flex min-h-control items-center gap-2 rounded-full border px-5 text-destacado no-underline transition-colors',
              marcada ? 'border-mar-primario bg-mar-primarioSuave font-bold text-mar-primario' : 'border-mar-bordeControl bg-mar-blanco text-mar-tinta hover:bg-mar-primarioSuave',
            )}
          >
            <span aria-hidden="true">{s.icono}</span>
            {s.titulo}
          </Link>
        )
      })}
    </nav>
  )
}
