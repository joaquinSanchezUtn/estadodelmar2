import { Link } from 'react-router-dom'
import { estadoPorId } from '../../data/estados'
import type { Tema } from '../../data/temas'
import { IconoCandado } from '../../componentes/base/iconos'

export default function TarjetaVentana({ tema }: { tema: Tema }) {
  return (
    <Link
      to={`/tema/${tema.slug}`}
      className="flex h-full flex-col gap-2.5 rounded-xl border border-mar-bordeArena bg-mar-blanco p-5 text-mar-tinta no-underline transition hover:border-mar-arena"
    >
      <span className="flex items-center justify-between text-xs uppercase tracking-widest text-mar-tintaSuave">
        {estadoPorId(tema.estado).nombre}
        <IconoCandado className="h-4 w-4 text-mar-tintaSuave" />
      </span>
      <span className="font-titulo text-xl lg:text-[21px]">{tema.titulo}</span>
      <span className="text-sm leading-relaxed text-mar-tintaSuave">{tema.descripcion}</span>
    </Link>
  )
}
