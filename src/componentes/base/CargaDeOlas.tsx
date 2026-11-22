import { motion, useReducedMotion } from 'motion/react'
import { olaDeCarga, oscilar } from '../../animaciones/movimiento'
import { cn } from '../../lib/cn'

type Props = { tamano?: 'chico' | 'grande'; className?: string }

// Una ola de dos períodos (cada uno mide 100 de ancho): al correrla medio ancho, vuelve a quedar igual y el
// bucle no se nota.
const ola = (alto: number, cresta: number) =>
  `M0 ${alto} Q 25 ${alto - cresta} 50 ${alto} T 100 ${alto} T 150 ${alto} T 200 ${alto} V 100 H 0 Z`

// Lo que se ve mientras algo carga (pedido de Joaquin, 2026-11-22: en vez de la palabra «Cargando…»): una
// ventanita redonda al mar con dos olas que corren a distinto ritmo, y el todo meciéndose apenas. Con
// `prefers-reduced-motion` las olas quedan quietas. El texto para lectores de pantalla va oculto.
export default function CargaDeOlas({ tamano = 'grande', className }: Props) {
  const quieto = useReducedMotion()
  const grande = tamano === 'grande'

  return (
    <div role="status" className={cn('flex items-center justify-center', grande && 'py-16', className)}>
      <span className="sr-only">Cargando…</span>
      <motion.span
        aria-hidden="true"
        animate={quieto || !grande ? undefined : oscilar(3, 1.6)}
        className={cn(
          'relative block overflow-hidden rounded-full bg-gradient-to-b from-mar-espuma to-mar-aguaClara',
          grande ? 'size-24 border-3 border-mar-primario shadow-ojo' : 'size-6 border-2 border-mar-primario',
        )}
      >
        {[
          { forma: ola(52, 10), clase: 'fill-mar-agua/50', seg: 2.6 },
          { forma: ola(62, 8), clase: 'fill-mar-primario', seg: 1.8 },
        ].map((capa) => (
          <motion.svg
            key={capa.seg}
            viewBox="0 0 200 100"
            preserveAspectRatio="none"
            className="absolute inset-y-0 left-0 h-full w-[200%]" // escala-ok: el dibujo mide dos veces el ancho, para el bucle
            animate={quieto ? undefined : olaDeCarga(capa.seg)}
          >
            <path d={capa.forma} className={capa.clase} />
          </motion.svg>
        ))}
      </motion.span>
    </div>
  )
}
