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

// Una sección de la home: título a la izquierda, un enlace opcional a la derecha ("Ver todos →") y el
// contenido abajo. Sin caja alrededor: el orden lo dan el título y el aire, no un borde.
export default function Seccion({ id, titulo, texto, enlace, className, children }: Props) {
  return (
    <section id={id} className={cn('scroll-mt-24 py-6 md:py-10', className)}>
      <div className="mb-6 flex flex-col gap-2 md:mb-8 md:flex-row md:items-end md:justify-between md:gap-6">
        <div>
          <h2 className="text-titulo-m md:text-titulo-l">{titulo}</h2>
          {texto && <p className="mt-2 max-w-parrafo text-destacado text-mar-tintaSuave">{texto}</p>}
        </div>
        {enlace && (
          <Link to={enlace.to} className="inline-flex min-h-control-sm shrink-0 items-center font-bold text-mar-primario no-underline hover:underline">
            {enlace.texto} →
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}
