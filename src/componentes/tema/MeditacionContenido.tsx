import type { Contenido } from '../../datos/tipos'
import { minutos } from '../../lib/formato'
import { Play } from '../base/iconos'

// Reproductor de reemplazo, igual que el del video: el audio se conecta con Bunny.
export default function MeditacionContenido({ contenido }: { contenido: Contenido }) {
  return (
    <div className="flex items-center gap-4 rounded-[13px] border border-mar-bordeAgua bg-mar-blanco p-[17px]">
      <button
        type="button"
        aria-label={`Reproducir meditación: ${contenido.titulo}`}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-mar-arena text-[#2A3E45] transition hover:brightness-95"
      >
        <Play className="h-5 w-5" />
      </button>
      <div>
        <h2 className="text-lg font-normal">{contenido.titulo}</h2>
        <p className="text-[15px] text-mar-tintaSuave">
          Meditación guiada · {minutos(contenido.duracionMin)}
        </p>
      </div>
    </div>
  )
}
