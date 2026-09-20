import { Link } from 'react-router-dom'
import type { EstadoMar, Tema } from '../../datos/tipos'
import { FlechaIzquierda } from '../base/iconos'
import Seccion from '../layout/Seccion'

type Props = { tema: Tema; estado: EstadoMar | null }

// Título, estado y descripción son públicos: se ven siempre.
export default function CabeceraTema({ tema, estado }: Props) {
  return (
    <Seccion fondo="degrade" angosta className="pb-8 pt-4 md:pb-10 md:pt-6 lg:pt-8">
      <Link
        to="/#ventanas"
        className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-[15px] text-mar-tintaSuave no-underline hover:text-mar-tinta"
      >
        <FlechaIzquierda />
        Todas las ventanas
      </Link>
      {estado && (
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-mar-agua">{estado.nombre}</p>
      )}
      <h1 className="mb-3.5 text-4xl font-light leading-[1.15] md:text-5xl">{tema.titulo}</h1>
      <p className="text-[17px] leading-relaxed text-mar-tintaSuave">{tema.descripcion}</p>
      {estado && (
        <blockquote className="mt-6 rounded-r-[10px] border-l-[3px] border-mar-aguaSuave bg-mar-espuma px-4 py-3.5 text-base leading-relaxed text-mar-tinta">
          {estado.ensenanza}.
        </blockquote>
      )}
    </Seccion>
  )
}
