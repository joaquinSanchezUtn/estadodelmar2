import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { cascada, emerger, viewportUnaVez } from '../../animaciones/movimiento'
import Seccion from './Seccion'

// Las cuatro prácticas del documento de la dueña. Textos en borrador: los revisa ella.
const practicas: { titulo: string; texto: string; enlace?: { to: string; texto: string } }[] = [
  {
    titulo: 'Meditación',
    texto: 'Volver a la profundidad, una y otra vez. Cada tema trae una meditación guiada, y todas se reúnen en su propia ventana.',
    enlace: { to: '/meditaciones', texto: 'Ir a las meditaciones' },
  },
  { titulo: 'Respiración', texto: 'El puente más corto entre la superficie y el fondo: aquietar el aire para que se aquiete la mente.' },
  { titulo: 'Autoconocimiento', texto: 'Reconocer las propias corrientes —creencias, hábitos, condicionamientos— para dejar de ir a donde nos llevan.' },
  { titulo: 'Servicio', texto: 'Llevar lo comprendido a la vida con los demás. Cada ejercitación propone un paso concreto.' },
]

// La enseñanza central del documento y las cuatro prácticas del "gimnasio del alma".
export default function GimnasioDelAlma() {
  return (
    <Seccion titulo="Un gimnasio del alma" texto="Cuatro prácticas que se entrenan como se entrena el cuerpo: de a poco y con constancia.">
      <figure className="mb-8 rounded-burbuja border-l-3 border-mar-atardecer bg-mar-blanco p-6 shadow-suave md:p-8">
        <blockquote className="font-titulo text-titulo-m font-light text-mar-tinta">«El problema no son las olas, sino creer que somos las olas.»</blockquote>
        <figcaption className="mt-3 text-cuerpo text-mar-tintaSuave">
          Las prácticas no eliminan las tormentas: fortalecen la capacidad de permanecer en la profundidad mientras las olas pasan.
        </figcaption>
      </figure>
      <motion.ul variants={cascada(0.08)} initial="oculto" whileInView="visible" viewport={viewportUnaVez} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {practicas.map((p) => (
          <motion.li key={p.titulo} variants={emerger} className="flex flex-col rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-6 shadow-suave">
            <h3 className="mb-2 text-titulo-s">{p.titulo}</h3>
            <p className="text-cuerpo text-mar-tintaSuave">{p.texto}</p>
            {p.enlace && (
              <Link to={p.enlace.to} className="mt-auto inline-flex min-h-control-sm items-center pt-3 font-bold text-mar-primario">
                {p.enlace.texto} →
              </Link>
            )}
          </motion.li>
        ))}
      </motion.ul>
    </Seccion>
  )
}
