import type { Contenido } from '../../datos/tipos'
import EjercitacionContenido from './EjercitacionContenido'
import MeditacionContenido from './MeditacionContenido'
import VideoContenido from './VideoContenido'

// Vista con acceso: muestra lo que efectivamente llegó.
export default function ContenidoAbierto({ contenidos }: { contenidos: Contenido[] }) {
  const de = (tipo: Contenido['tipo']) => contenidos.find((c) => c.tipo === tipo)
  const video = de('video')
  const meditacion = de('meditacion')
  const ejercitacion = de('ejercitacion')

  if (contenidos.length === 0) {
    return (
      <p className="rounded-burbuja border border-dashed border-mar-bordeAgua bg-mar-blanco/60 p-5 text-base text-mar-tintaSuave">
        Esta ventana todavía no tiene contenido publicado.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3.5">
      {video && <VideoContenido contenido={video} />}
      {meditacion && <MeditacionContenido contenido={meditacion} />}
      {ejercitacion && <EjercitacionContenido contenido={ejercitacion} />}
    </div>
  )
}
