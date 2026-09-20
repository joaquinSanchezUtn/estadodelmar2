import { Link } from 'react-router-dom'
import type { Tema } from '../../datos/tipos'
import Candado from '../base/Candado'

type Props = { tema: Tema; estadoNombre?: string; bloqueada: boolean }

export default function TarjetaVentana({ tema, estadoNombre, bloqueada }: Props) {
  return (
    <Link
      to={`/tema/${tema.slug}`}
      className="flex h-full flex-col gap-2.5 rounded-xl border border-mar-bordeCielo bg-mar-blanco p-5 text-mar-tinta no-underline transition hover:border-mar-celeste"
    >
      <span className="flex min-h-[16px] items-center justify-between text-xs uppercase tracking-widest text-mar-tintaSuave">
        {estadoNombre}
        {bloqueada && (
          <Candado etiqueta="Contenido para suscriptoras" className="h-4 w-4 text-mar-tintaSuave" />
        )}
      </span>
      <span className="font-titulo text-xl md:text-[21px]">{tema.titulo}</span>
      <span className="text-sm leading-relaxed text-mar-tintaSuave">{tema.descripcion}</span>
    </Link>
  )
}
