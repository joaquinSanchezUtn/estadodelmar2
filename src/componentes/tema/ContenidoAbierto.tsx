import type { Contenido } from '../../datos/tipos'
import EjercitacionContenido from './EjercitacionContenido'
import MeditacionContenido from './MeditacionContenido'
import VideoContenido from './VideoContenido'

// Vista con acceso: todas las piezas que llegaron, en el orden que eligió la dueña (desde la 0020 un tema
// puede tener varios videos, meditaciones o ejercitaciones; ya vienen ordenadas por `orden`).
export default function ContenidoAbierto({ contenidos }: { contenidos: Contenido[] }) {
  if (contenidos.length === 0) {
    return (
      <p className="rounded-burbuja border border-dashed border-mar-bordeAgua bg-mar-blanco/60 p-5 text-cuerpo text-mar-tintaSuave">
        Este tema todavía no tiene contenido publicado.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {contenidos.map((c) =>
        c.tipo === 'video' ? (
          <VideoContenido key={c.id} contenido={c} />
        ) : c.tipo === 'meditacion' ? (
          <MeditacionContenido key={c.id} contenido={c} />
        ) : (
          <EjercitacionContenido key={c.id} contenido={c} />
        ),
      )}
    </div>
  )
}
