import { Link } from 'react-router-dom'
import { URL_LOGO } from '../../lib/activos'
import { cn } from '../../lib/cn'

type Props = { onClick?: () => void; className?: string }

// El emblema (la ola con el brote) junto al nombre del sitio, siempre al inicio. `alt` va vacío
// a propósito: el nombre de al lado ya dice lo mismo, y así el lector de pantalla no lo repite.
export default function LogoDelSitio({ onClick, className }: Props) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className={cn('inline-flex min-h-control-sm items-center gap-2 font-titulo text-titulo-s text-mar-tinta no-underline', className)}
    >
      <img src={URL_LOGO} alt="" width={36} height={36} className="size-9" />
      Estado del mar
    </Link>
  )
}
