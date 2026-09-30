import { motion } from 'motion/react'
import { cascada, emerger, viewportUnaVez } from '../../animaciones/movimiento'
import Seccion from './Seccion'

const pasos = [
  { titulo: 'Ubicá tu estado', texto: 'Calma, tormenta, mareas… cada estado del mar abre los temas que te pueden ayudar.' },
  { titulo: 'Comprendé y meditá', texto: 'Un video breve explica qué te pasa y una meditación guiada te lleva a la profundidad.' },
  { titulo: 'Llevalo a tu vida', texto: 'Una ejercitación concreta para practicar lo aprendido en tu día a día.' },
]

// El recorrido de cada tema, en tres pasos numerados: para que se entienda de un vistazo qué se hace acá.
export default function ComoFunciona() {
  return (
    <Seccion id="como-funciona" titulo="Cómo funciona" texto="Tres pasos, cada vez que lo necesites.">
      <motion.ol variants={cascada(0.08)} initial="oculto" whileInView="visible" viewport={viewportUnaVez} className="grid gap-4 md:grid-cols-3 md:gap-5">
        {pasos.map((p, i) => (
          <motion.li key={p.titulo} variants={emerger} className="rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-6 shadow-suave">
            <span aria-hidden="true" className="mb-4 flex size-10 items-center justify-center rounded-tarjeta bg-mar-primarioSuave text-destacado font-bold text-mar-primario">
              {i + 1}
            </span>
            <h3 className="mb-2 text-titulo-s">{p.titulo}</h3>
            <p className="text-cuerpo text-mar-tintaSuave">{p.texto}</p>
          </motion.li>
        ))}
      </motion.ol>
    </Seccion>
  )
}
