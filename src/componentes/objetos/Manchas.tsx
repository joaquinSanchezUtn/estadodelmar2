import { motion } from 'motion/react'
import { flotar, useMovimiento } from '../../animaciones/movimiento'
import { cn } from '../../lib/cn'

// Círculos muy difusos detrás de las burbujas: atmósfera, no decoración. Dos o tres por
// pantalla como máximo. En celular no se cargan.
const manchas = [
  { pos: '-left-16 -top-20', tam: 'h-64 w-64', color: 'bg-mar-aguaSuave/40', desfase: 0, seg: 8 },
  { pos: '-bottom-24 -right-10', tam: 'h-72 w-72', color: 'bg-mar-celeste/25', desfase: 1.6, seg: 9 },
  { pos: 'left-1/3 top-1/2', tam: 'h-40 w-40', color: 'bg-mar-blanco/70', desfase: 3.1, seg: 7 },
]

export default function Manchas({ cantidad = 3, className }: { cantidad?: number; className?: string }) {
  const { bucles, decoracionGrande } = useMovimiento()
  if (!decoracionGrande) return null

  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {manchas.slice(0, cantidad).map((m, i) => (
        <motion.span
          key={i}
          animate={bucles ? flotar(m.desfase, m.seg) : undefined}
          className={cn('absolute rounded-full blur-3xl', m.pos, m.tam, m.color)}
        />
      ))}
    </div>
  )
}
