import type { EstadoMar } from '../../datos/tipos'
import { cn } from '../../lib/cn'
import { urlDeEstado } from '../../lib/estados'
import Tarjeta from '../base/Tarjeta'
import DibujoEstado from '../objetos/DibujoEstado'
import { coloresEstado } from '../objetos/estados/colores'

type Props = { estado: EstadoMar; cantidad: number | null }

// La puerta de entrada al sitio: una tarjeta del color del estado, con su dibujo, qué se vive ahí, la
// enseñanza y cuántos temas hay. Es un enlace real a la página del estado.
export default function TarjetaEstado({ estado, cantidad }: Props) {
  const c = coloresEstado[estado.id]

  return (
    <Tarjeta to={urlDeEstado(estado.id)} className={cn('flex h-full flex-col gap-2 overflow-hidden p-4 shadow-suave sm:p-5', c.fondo, c.borde)}>
      <span aria-hidden="true" className={cn('relative -mx-4 -mt-4 mb-1 block h-14 overflow-hidden sm:-mx-5 sm:-mt-5 sm:mb-2 sm:h-20', c.agua)}>
        <DibujoEstado estado={estado.id} />
      </span>
      <span className="font-titulo text-destacado text-mar-tinta sm:text-titulo-s">{estado.nombre}</span>
      <span className="text-meta text-mar-tintaSuave">{estado.estadoInterno}.</span>
      {/* La enseñanza, solo con lugar: en el celular la tarjeta va de a dos y queda en la página del estado. */}
      <span className="hidden font-titulo text-meta italic text-mar-tintaTenue sm:block">{estado.ensenanza}.</span>
      <span className="mt-auto pt-2 text-meta font-bold text-mar-tinta">
        {cantidad === null ? 'Ver temas' : cantidad === 0 ? 'Próximamente' : `${cantidad} ${cantidad === 1 ? 'tema' : 'temas'}`} →
      </span>
    </Tarjeta>
  )
}
