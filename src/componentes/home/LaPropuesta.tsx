import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cascada, emerger, viewportUnaVez } from '../../animaciones/movimiento'
import Burbuja from '../base/Burbuja'
import Tarjeta from '../base/Tarjeta'
import { Lapiz, Ondas, Play } from '../base/iconos'
import TituloBurbuja from './TituloBurbuja'

const piezas: { icono: ReactNode; titulo: string; texto: string }[] = [
  {
    icono: <Play className="h-5 w-5" />,
    titulo: 'Video psicoeducativo',
    texto: 'Explica con claridad qué ocurre en la mente y en el cuerpo, y por qué ocurre.',
  },
  {
    icono: <Ondas className="h-6 w-6" />,
    titulo: 'Meditación guiada',
    texto: 'Una práctica breve para volver a la profundidad cuando la superficie está agitada.',
  },
  {
    icono: <Lapiz className="h-5 w-5" />,
    titulo: 'Ejercitación',
    texto: 'Una consigna concreta para llevar lo comprendido a la vida cotidiana.',
  },
]

export default function LaPropuesta() {
  return (
    <Burbuja id="propuesta" tono="blanco">
      <TituloBurbuja
        titulo="Qué hay en cada ventana"
        texto="Tres piezas que se acompañan: primero se comprende, después se practica."
      />
      <motion.ul
        variants={cascada(0.08)}
        initial="oculto"
        whileInView="visible"
        viewport={viewportUnaVez}
        className="grid gap-4 md:grid-cols-3 md:gap-5"
      >
        {piezas.map((p) => (
          <motion.li key={p.titulo} variants={emerger}>
            <Tarjeta tono="aguaClara" className="h-full p-6">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-mar-espuma text-mar-agua">
                {p.icono}
              </span>
              <h3 className="mb-2 text-xl font-normal">{p.titulo}</h3>
              <p className="text-base leading-relaxed text-mar-tintaSuave">{p.texto}</p>
            </Tarjeta>
          </motion.li>
        ))}
      </motion.ul>
    </Burbuja>
  )
}
