import { motion } from 'motion/react'
import type { EstadoMarId, Pieza, TipoContenido } from '../../datos/tipos'
import { cn } from '../../lib/cn'
import { minutos } from '../../lib/formato'
import { coloresDe } from '../objetos/estados/colores'
import VidrioEsmerilado from '../ventana/VidrioEsmerilado'

const nombres: Record<TipoContenido, string> = {
  video: 'Video psicoeducativo',
  meditacion: 'Meditación guiada',
  ejercitacion: 'Ejercitación',
}

type Props = { pieza: Pieza; estado: EstadoMarId | null }

// Una pieza que todavía no se puede abrir. Del contenido solo se conoce lo público (tipo y
// duración); el recuadro esmerilado es un dibujo decorativo, no el contenido real.
export default function PiezaBloqueada({ pieza, estado }: Props) {
  return (
    <motion.li
      initial="reposo"
      animate="reposo"
      exit="salida"
      className="flex items-center gap-4 rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-4"
    >
      <span className={cn('relative block h-16 w-24 shrink-0 overflow-hidden rounded-tarjeta', coloresDe(estado).agua)}>
        <VidrioEsmerilado estado={estado} />
      </span>
      <span className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-titulo text-titulo-s">{nombres[pieza.tipo]}</span>
        <span className="text-cuerpo text-mar-tintaSuave">{minutos(pieza.duracionMin)}</span>
      </span>
    </motion.li>
  )
}
