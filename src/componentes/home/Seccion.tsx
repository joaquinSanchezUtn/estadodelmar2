import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

type Props = {
  id?: string
  titulo: string
  texto?: string
  enlace?: { to: string; texto: string }
  className?: string
  children: ReactNode
}

// Una sección de la home: título, texto y un enlace opcional ("Ver todos →"), centrados; el contenido abajo.
// Sin caja alrededor: el orden lo dan el título y el aire, no un borde.
export default function Seccion({ id, titulo, texto, enlace, className, children }: Props) {
  return (
    <section id={id} className={cn('scroll-mt-24 py-6 md:py-10', className)}>
      <div className="mx-auto mb-8 flex max-w-parrafo flex-col items-center gap-2 text-center md:mb-10">
        <h2 className="text-titulo-m md:text-titulo-l">{titulo}</h2>
        {texto && <p className="text-destacado text-mar-tintaSuave">{texto}</p>}
        {enlace && (
          <Link to={enlace.to} className="inline-flex min-h-control-sm items-center font-bold text-mar-primario no-underline hover:underline">
            {enlace.texto} →
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}
