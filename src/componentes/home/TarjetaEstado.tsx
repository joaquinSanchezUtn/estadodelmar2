import clsx from 'clsx'
import { Link } from 'react-router-dom'
import type { EstadoMar } from '../../datos/tipos'

type Props = { estado: EstadoMar; activo: boolean }

// Enlace real: filtra las ventanas por estado. Tocar el activo quita el filtro.
export default function TarjetaEstado({ estado, activo }: Props) {
  return (
    <Link
      to={activo ? '/#ventanas' : `/?estado=${estado.id}#ventanas`}
      aria-current={activo ? 'true' : undefined}
      className={clsx(
        'flex h-full min-h-[92px] flex-col gap-1.5 rounded-xl border p-4 no-underline transition md:gap-2 md:p-5',
        activo
          ? 'border-mar-agua bg-mar-espuma'
          : 'border-mar-bordeAgua bg-mar-blanco hover:border-mar-aguaSuave',
      )}
    >
      <span className="font-titulo text-lg text-mar-tinta md:text-xl">{estado.nombre}</span>
      <span className="text-sm leading-relaxed text-mar-tintaSuave">{estado.estadoInterno}.</span>
    </Link>
  )
}
