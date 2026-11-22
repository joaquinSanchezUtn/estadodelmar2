import type { ResultadoAdmin } from '../../datos/tipos'
import { Abajo, Arriba } from '../base/iconos'
import Boton from '../base/Boton'

type Props = {
  nombre: string
  posicion: number
  total: number
  pendiente: boolean
  mover: (direccion: 'arriba' | 'abajo') => Promise<ResultadoAdmin>
  correr: (hacer: () => Promise<ResultadoAdmin>, aviso: string) => void
}

// «Subir» y «Bajar», con palabras además de la flecha: cambia el lugar de algo en su lista (una ventana, un
// tema o una pieza). Con un solo elemento en la lista no aparece.
export default function BotonesDeOrden({ nombre, posicion, total, pendiente, mover, correr }: Props) {
  if (total < 2) return null
  return (
    <div className="flex gap-2">
      <Boton compacto variante="secundario" disabled={pendiente || posicion === 0} aria-label={`Subir «${nombre}» (hoy está en el lugar ${posicion + 1} de ${total})`} onClick={() => correr(() => mover('arriba'), `«${nombre}» subió un lugar.`)}>
        <Arriba className="size-4" />
        <span className="ml-1">Subir</span>
      </Boton>
      <Boton compacto variante="secundario" disabled={pendiente || posicion === total - 1} aria-label={`Bajar «${nombre}» (hoy está en el lugar ${posicion + 1} de ${total})`} onClick={() => correr(() => mover('abajo'), `«${nombre}» bajó un lugar.`)}>
        <Abajo className="size-4" />
        <span className="ml-1">Bajar</span>
      </Boton>
    </div>
  )
}
