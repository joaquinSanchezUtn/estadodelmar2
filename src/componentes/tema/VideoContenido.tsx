import { motion } from 'motion/react'
import { presionar } from '../../animaciones/movimiento'
import type { Contenido } from '../../datos/tipos'
import { minutos } from '../../lib/formato'
import { Play } from '../base/iconos'

// Reproductor de reemplazo. Cuando entre Bunny, acá va el player con la URL firmada por la
// Edge Function.
export default function VideoContenido({ contenido }: { contenido: Contenido }) {
  return (
    <div className="overflow-hidden rounded-burbuja border border-mar-bordeAgua bg-mar-blanco">
      <div className="flex aspect-video items-center justify-center bg-mar-espuma">
        <motion.button
          type="button"
          whileTap={presionar}
          aria-label={`Reproducir video: ${contenido.titulo}`}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-mar-celeste text-mar-tintaBoton transition hover:brightness-95"
        >
          <Play className="h-6 w-6" />
        </motion.button>
      </div>
      <div className="p-5">
        <h2 className="mb-1 text-xl font-normal">{contenido.titulo}</h2>
        <p className="text-[15px] text-mar-tintaSuave">
          Video psicoeducativo · {minutos(contenido.duracionMin)}
        </p>
      </div>
    </div>
  )
}
