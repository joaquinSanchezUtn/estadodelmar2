import { Link } from 'react-router-dom'
import { moverEstadoAdmin } from '../../datos/estados'
import type { EstadoMarAdmin, ResultadoAdmin } from '../../datos/tipos'
import { cn } from '../../lib/cn'
import { useAccion } from '../../lib/useAccion'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import { Abajo, Arriba } from '../base/iconos'
import Sello from '../base/Sello'
import ImagenDeVentana from '../objetos/ImagenDeVentana'
import { coloresDe } from '../objetos/estados/colores'

type Props = { estado: EstadoMarAdmin; temas: number; posicion: number; total: number; onCambio: (aviso: string) => void }

const icono = 'flex size-11 items-center justify-center rounded-full border border-mar-bordeControl bg-mar-blanco text-mar-tinta hover:bg-mar-aguaClara disabled:opacity-40'

// Una ventana en la lista del panel: su imagen, cuántos temas tiene, subir y bajar, y editar.
export default function FilaEstado({ estado, temas, posicion, total, onCambio }: Props) {
  const accion = useAccion()
  const mover = (direccion: 'arriba' | 'abajo', aviso: string) =>
    accion.ejecutar(async () => {
      const r: ResultadoAdmin = await moverEstadoAdmin(estado.id, direccion)
      if (!r.ok) return r.mensaje
      onCambio(aviso)
      return null
    })

  return (
    <li className="rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-4 shadow-suave">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span aria-hidden="true" className={cn('relative block h-16 w-24 shrink-0 overflow-hidden rounded-tarjeta', coloresDe(estado.estilo).agua)}>
          <ImagenDeVentana estado={estado} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <Link to={`/admin/estados/${estado.id}`} className="inline-flex min-h-control-sm items-center font-titulo text-titulo-s text-mar-tinta no-underline hover:underline">
              {estado.nombre}
            </Link>
            <Sello tono={estado.publicado ? 'agua' : 'neutro'}>{estado.publicado ? 'Visible' : 'Oculta'}</Sello>
          </div>
          <p className="text-meta text-mar-tintaSuave">
            {temas === 0 ? 'Sin temas' : `${temas} ${temas === 1 ? 'tema' : 'temas'}`}
            {estado.fotoUrl ? ' · con foto' : ' · sin foto'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={icono} disabled={accion.pendiente || posicion === 0} aria-label={`Subir «${estado.nombre}» (hoy es la ${posicion + 1} de ${total})`} onClick={() => mover('arriba', `«${estado.nombre}» subió al puesto ${posicion}.`)}>
            <Arriba />
          </button>
          <button type="button" className={icono} disabled={accion.pendiente || posicion === total - 1} aria-label={`Bajar «${estado.nombre}» (hoy es la ${posicion + 1} de ${total})`} onClick={() => mover('abajo', `«${estado.nombre}» bajó al puesto ${posicion + 2}.`)}>
            <Abajo />
          </button>
          <Boton compacto to={`/admin/estados/${estado.id}`}>
            Editar
          </Boton>
        </div>
      </div>
      {accion.error && <Aviso className="mt-4">{accion.error}</Aviso>}
    </li>
  )
}
