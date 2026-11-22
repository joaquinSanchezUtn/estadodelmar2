import { motion, useReducedMotion } from 'motion/react'
import { onda, respirar } from '../../animaciones/movimiento'
import { URL_LOGO } from '../../lib/activos'
import { cn } from '../../lib/cn'

type Props = { tamano?: 'chico' | 'grande'; className?: string }

const pantalla = 'flex min-h-[70vh] items-center justify-center' // escala-ok: ocupa el alto de la pantalla para quedar centrada

// Lo que se ve mientras algo carga (pedido de Joaquin, 2026-11-22: en vez de la palabra «Cargando…», y después
// «algo como el emblema del logo»): el emblema de Marea Interior respirando despacio, con ondas que se abren a
// su alrededor como en el agua. El grande va centrado y bastante abajo del encabezado, donde mira el ojo. Con
// `prefers-reduced-motion`, quieto. El texto para lectores de pantalla va oculto.
export default function CargaDeOlas({ tamano = 'grande', className }: Props) {
  const quieto = useReducedMotion()
  const grande = tamano === 'grande'

  if (!grande) {
    return (
      <span role="status" className={cn('inline-flex items-center', className)}>
        <span className="sr-only">Cargando…</span>
        <motion.img src={URL_LOGO} alt="" width={24} height={24} className="size-6" animate={quieto ? undefined : respirar(1.4)} />
      </span>
    )
  }

  return (
    <div role="status" className={cn(pantalla, className)}>
      <span className="sr-only">Cargando…</span>
      <span aria-hidden="true" className="relative flex size-32 items-center justify-center">
        {!quieto &&
          [0, 1, 2].map((i) => (
            <motion.span key={i} className="absolute inset-0 rounded-full border-2 border-mar-agua" initial={{ scale: 0.6, opacity: 0 }} animate={onda(2.4, i * 0.8)} />
          ))}
        <motion.img src={URL_LOGO} alt="" width={96} height={96} className="relative size-24" animate={quieto ? undefined : respirar(2.4)} />
      </span>
    </div>
  )
}
