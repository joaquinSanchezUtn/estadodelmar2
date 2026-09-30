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
    <Tarjeta to={urlDeEstado(estado.id)} className={cn('flex h-full flex-col gap-2 overflow-hidden p-5 shadow-suave', c.fondo, c.borde)}>
      <span aria-hidden="true" className={cn('relative -mx-5 -mt-5 mb-2 block h-20 overflow-hidden', c.agua)}>
        <DibujoEstado estado={estado.id} />
      </span>
      <span className="font-titulo text-titulo-s text-mar-tinta">{estado.nombre}</span>
      <span className="text-meta text-mar-tintaSuave">{estado.estadoInterno}.</span>
      <span className="font-titulo text-meta italic text-mar-tintaTenue">{estado.ensenanza}.</span>
      <span className="mt-auto pt-2 text-meta font-bold text-mar-tinta">
        {cantidad === null ? 'Ver temas' : cantidad === 0 ? 'Próximamente' : `${cantidad} ${cantidad === 1 ? 'tema' : 'temas'}`} →
      </span>
    </Tarjeta>
  )
}
