import type { Contenido } from '../../datos/tipos'
import { minutos } from '../../lib/formato'
import Reproductor from '../reproductor/Reproductor'

export default function VideoContenido({ contenido }: { contenido: Contenido }) {
  return (
    <div className="overflow-hidden rounded-burbuja border border-mar-bordeAgua bg-mar-blanco">
      <Reproductor tipo="video" contenidoId={contenido.id} titulo={contenido.titulo} />
      <div className="border-t border-mar-bordeAgua p-5">
        <h2 className="mb-1 text-titulo-s font-normal">{contenido.titulo}</h2>
        <p className="text-cuerpo text-mar-tintaSuave">Video psicoeducativo · {minutos(contenido.duracionMin)}</p>
      </div>
    </div>
  )
}
