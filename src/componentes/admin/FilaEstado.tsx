import { Link } from 'react-router-dom'
import { moverEstadoAdmin } from '../../datos/estados'
import type { EstadoMarAdmin, ResultadoAdmin } from '../../datos/tipos'
import { cn } from '../../lib/cn'
import { useAccion } from '../../lib/useAccion'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import Sello from '../base/Sello'
import ImagenDeVentana from '../objetos/ImagenDeVentana'
import { coloresDe } from '../objetos/estados/colores'
import BotonesDeOrden from './BotonesDeOrden'

type Props = { estado: EstadoMarAdmin; temas: number; posicion: number; total: number; onCambio: (aviso: string) => void }

// Una ventana en la lista del panel: su foto, su nombre, cuántos temas tiene y si se ve en el sitio. Tocarla
// abre sus temas. Mostrar, ocultar, cambiar los textos o la foto y eliminar están adentro, en «Cambiar esta
// ventana»: acá solo se abre y se ordena, para que la lista no se llene de botones.
export default function FilaEstado({ estado, temas, posicion, total, onCambio }: Props) {
  const accion = useAccion()
  const correr = (hacer: () => Promise<ResultadoAdmin>, aviso: string) =>
    accion.ejecutar(async () => {
      const r = await hacer()
      if (!r.ok) return r.mensaje
      onCambio(aviso)
      return null
    })
  const abrir = `/admin/estados/${estado.id}`

  return (
    <li className="rounded-burbuja border-2 border-mar-bordeAgua bg-mar-blanco p-4 shadow-suave md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Link to={abrir} tabIndex={-1} aria-hidden="true" className={cn('relative block h-28 w-full shrink-0 overflow-hidden rounded-tarjeta md:h-24 md:w-36', coloresDe(estado.estilo).agua)}>
          <span className="absolute inset-0">
            <ImagenDeVentana estado={estado} />
          </span>
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Link to={abrir} className="font-titulo text-titulo-m text-mar-tinta no-underline hover:underline">
            {estado.nombre}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Sello tono="neutro">{temas === 0 ? 'Todavía sin temas' : `${temas} ${temas === 1 ? 'tema' : 'temas'}`}</Sello>
            <Sello tono={estado.publicado ? 'agua' : 'coral'}>{estado.publicado ? 'Se ve en el sitio' : 'Oculta'}</Sello>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BotonesDeOrden nombre={estado.nombre} posicion={posicion} total={total} pendiente={accion.pendiente} mover={(d) => moverEstadoAdmin(estado.id, d)} correr={correr} />
          <Boton to={abrir}>Abrir</Boton>
        </div>
      </div>
      {accion.error && <Aviso className="mt-4">{accion.error}</Aviso>}
    </li>
  )
}
