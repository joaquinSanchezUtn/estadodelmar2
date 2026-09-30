import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { cascada, emerger, viewportUnaVez } from '../../animaciones/movimiento'
import Burbuja from '../base/Burbuja'
import Tarjeta from '../base/Tarjeta'
import TituloBurbuja from './TituloBurbuja'

// Las cuatro prácticas del documento de la dueña. Textos en borrador: los revisa ella.
const practicas: { titulo: string; texto: string; enlace?: { to: string; texto: string } }[] = [
  {
    titulo: 'Meditación',
    texto: 'Volver a la profundidad, una y otra vez. Cada ventana trae una meditación guiada, y todas se reúnen en su propia ventana.',
    enlace: { to: '/meditaciones', texto: 'Ir a las meditaciones' },
  },
  {
    titulo: 'Respiración',
    texto: 'El puente más corto entre la superficie y el fondo: aquietar el aire para que se aquiete la mente.',
  },
  {
    titulo: 'Autoconocimiento',
    texto: 'Reconocer las propias corrientes —creencias, hábitos, condicionamientos— para dejar de ir a donde nos llevan.',
  },
  {
    titulo: 'Servicio',
    texto: 'Llevar lo comprendido a la vida con los demás. Cada ejercitación propone un paso concreto.',
  },
]

// La enseñanza central y las prácticas del "gimnasio del alma".
export default function GimnasioDelAlma() {
  return (
    <Burbuja tono="arena">
      <figure className="mx-auto mb-10 max-w-parrafo text-center md:mb-12">
        <blockquote className="mb-4 font-titulo text-titulo-m font-light text-mar-tinta md:text-titulo-l">
          «El problema no son las olas, sino creer que somos las olas.»
        </blockquote>
        <figcaption className="text-cuerpo text-mar-tintaSuave">
          Las prácticas no eliminan las tormentas: fortalecen la capacidad de permanecer en la profundidad mientras las olas pasan.
        </figcaption>
      </figure>

      <TituloBurbuja titulo="Un gimnasio del alma" texto="Cuatro prácticas que se entrenan como se entrena el cuerpo: de a poco y con constancia." />
      <motion.ul
        variants={cascada(0.08)}
        initial="oculto"
        whileInView="visible"
        viewport={viewportUnaVez}
        className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4"
      >
        {practicas.map((p) => (
          <motion.li key={p.titulo} variants={emerger}>
            <Tarjeta tono="niebla" className="flex h-full flex-col p-6">
              <h3 className="mb-2 text-titulo-s font-normal">{p.titulo}</h3>
              <p className="text-cuerpo text-mar-tintaSuave">{p.texto}</p>
              {p.enlace && (
                <Link to={p.enlace.to} className="mt-auto inline-flex min-h-control-sm items-center pt-3 text-cuerpo">
                  {p.enlace.texto}
                </Link>
              )}
            </Tarjeta>
          </motion.li>
        ))}
      </motion.ul>
    </Burbuja>
  )
}
