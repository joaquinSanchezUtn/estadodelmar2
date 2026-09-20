import { motion } from 'motion/react'
import { curva, useMovimiento } from '../../animaciones/movimiento'
import { cn } from '../../lib/cn'

// Pocos círculos chicos de contorno fino que suben lentamente. Solo en el héroe y en la
// suscripción. Sin reduced motion; en celular, apenas dos.
const burbujitas = [
  { izq: '8%', tam: 'h-3 w-3', seg: 13, desfase: 0 },
  { izq: '22%', tam: 'h-5 w-5', seg: 17, desfase: 4 },
  { izq: '46%', tam: 'h-2.5 w-2.5', seg: 15, desfase: 8 },
  { izq: '68%', tam: 'h-4 w-4', seg: 19, desfase: 2 },
  { izq: '84%', tam: 'h-3 w-3', seg: 14, desfase: 6 },
  { izq: '93%', tam: 'h-2 w-2', seg: 16, desfase: 10 },
]

export default function Burbujitas({ className }: { className?: string }) {
  const { reducido, escritorio } = useMovimiento()
  if (reducido) return null
  const visibles = escritorio ? burbujitas : burbujitas.slice(0, 2)

  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {visibles.map((b, i) => (
        <motion.span
          key={i}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -260, opacity: [0, 0.8, 0] }}
          transition={{ duration: b.seg, repeat: Infinity, ease: curva, delay: b.desfase }}
          className={cn('absolute bottom-0 rounded-full border border-mar-aguaSuave', b.tam)}
          style={{ left: b.izq }}
        />
      ))}
    </div>
  )
}
