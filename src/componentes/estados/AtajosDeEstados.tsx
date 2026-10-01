import { Link } from 'react-router-dom'
import { estados } from '../../datos/constantes'
import type { EstadoMarId } from '../../datos/tipos'
import { cn } from '../../lib/cn'
import { urlDeEstado } from '../../lib/estados'
import { coloresEstado } from '../objetos/estados/colores'

type Props = { excepto?: EstadoMarId; centrado?: boolean }

// Los estados del mar como pastillas de su color, cada una un enlace a su página. Es la puerta de entrada
// del sitio repetida donde alguien puede quedar sin rumbo: Mi cuenta, una página que no existe, otro estado.
export default function AtajosDeEstados({ excepto, centrado = false }: Props) {
  return (
    <ul className={cn('flex flex-wrap gap-2', centrado && 'justify-center')}>
      {estados
        .filter((e) => e.id !== excepto)
        .map((e) => (
          <li key={e.id}>
            <Link
              to={urlDeEstado(e.id)}
              className={cn(
                'inline-flex min-h-control-sm items-center rounded-full border px-4 text-meta font-bold text-mar-tinta no-underline transition-shadow hover:shadow-suave',
                coloresEstado[e.id].fondo,
                coloresEstado[e.id].borde,
              )}
            >
              {e.nombre}
            </Link>
          </li>
        ))}
    </ul>
  )
}
