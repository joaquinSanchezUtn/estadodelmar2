import { motion, type MotionValue } from 'motion/react'
import { marea, useMovimiento } from '../../animaciones/movimiento'
import { cn } from '../../lib/cn'

// Capas de olas SVG a la deriva. Cada capa dibuja dos períodos (1200 de ancho) y se
// desplaza uno entero, así el bucle no tiene corte. Decorativo: aria-hidden y sin clics.
const capas = [
  // La de atrás es agua más profunda; la de adelante, espuma clara. Sobre una burbuja tintada las dos se ven.
  { fondo: 'fill-mar-celeste', trazo: 'M0 60 Q150 18 300 60 T600 60 T900 60 T1200 60 V140 H0Z', seg: 24, opacidad: 'opacity-30' },
  { fondo: 'fill-mar-blanco', trazo: 'M0 78 Q150 44 300 78 T600 78 T900 78 T1200 78 V140 H0Z', seg: 38, opacidad: 'opacity-70' },
]

type Props = { className?: string; parallax?: MotionValue<number> }

export default function Olas({ className, parallax }: Props) {
  const { bucles, decoracionGrande } = useMovimiento()
  // En celular no se cargan las capas grandes: queda una sola ola, quieta.
  const visibles = decoracionGrande ? capas : capas.slice(0, 1)

  return (
    <motion.div
      aria-hidden="true"
      style={{ y: parallax }}
      className={cn('pointer-events-none absolute inset-x-0 bottom-0 h-28 overflow-hidden md:h-40', className)}
    >
      {visibles.map((c, i) => (
        <motion.div
          key={i}
          animate={bucles ? marea(c.seg, -600) : undefined}
          className="absolute bottom-0 left-0 h-full w-[200%]" /* escala-ok: la ola mide el doble para desplazarse sin cortes */
        >
          <svg viewBox="0 0 1200 140" preserveAspectRatio="none" className={cn('h-full w-full', c.opacidad)}>
            <path d={c.trazo} className={c.fondo} />
          </svg>
        </motion.div>
      ))}
    </motion.div>
  )
}
