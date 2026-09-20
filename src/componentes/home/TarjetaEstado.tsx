import type { EstadoMar } from '../../datos/tipos'
import { cn } from '../../lib/cn'
import { urlDeEstado } from '../../lib/estados'
import Tarjeta from '../base/Tarjeta'
import DibujoEstado from '../objetos/DibujoEstado'
import { coloresEstado } from '../objetos/estados/colores'

type Props = { estado: EstadoMar; cantidad: number | null }

// Enlace real a la página del estado. El matiz del estado tiñe la tarjeta, el agua y el dibujo; abajo, la
// enseñanza de la metáfora y cuántas ventanas hay ahí.
export default function TarjetaEstado({ estado, cantidad }: Props) {
  const c = coloresEstado[estado.id]

  return (
    <Tarjeta to={urlDeEstado(estado.id)} className={cn('flex h-full flex-col gap-3 p-4 shadow-tarjeta md:p-5', c.fondo, c.borde)}>
      <span className={cn('relative block h-24 overflow-hidden rounded-tarjeta', c.agua)}>
        <DibujoEstado estado={estado.id} />
      </span>
      <span className="font-titulo text-titulo-s text-mar-tinta">{estado.nombre}</span>
      <span className="text-meta text-mar-tintaSuave">{estado.estadoInterno}.</span>
      <span className="mt-auto pt-1 font-titulo text-meta italic text-mar-tintaTenue">{estado.ensenanza}.</span>
      {cantidad !== null && (
        <span className="text-meta font-medium text-mar-tinta">
          {cantidad} {cantidad === 1 ? 'ventana' : 'ventanas'}
        </span>
      )}
    </Tarjeta>
  )
}
