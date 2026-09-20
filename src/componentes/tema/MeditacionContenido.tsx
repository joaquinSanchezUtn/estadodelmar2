import type { Contenido } from '../../datos/tipos'
import { minutos } from '../../lib/formato'
import Reproductor from '../reproductor/Reproductor'

export default function MeditacionContenido({ contenido }: { contenido: Contenido }) {
  return (
    <div className="overflow-hidden rounded-burbuja border border-mar-bordeAgua bg-mar-blanco">
      <Reproductor
        tipo="audio"
        contenidoId={contenido.id}
        titulo={contenido.titulo}
        cabecera={
          <div>
            <h2 className="text-titulo-s font-normal">{contenido.titulo}</h2>
            <p className="text-cuerpo text-mar-tintaSuave">Meditación guiada · {minutos(contenido.duracionMin)}</p>
          </div>
        }
      />
    </div>
  )
}
