import { motion, useScroll, useTransform } from 'motion/react'
import { cascada, fundido, useMovimiento } from '../../animaciones/movimiento'
import Boton from '../base/Boton'
import Burbuja from '../base/Burbuja'
import Burbujitas from '../objetos/Burbujitas'
import Olas from '../objetos/Olas'

export default function Portada() {

  const { bucles } = useMovimiento()
  // Parallax muy leve ligado al scroll: unos pocos píxeles, nada de profundidad exagerada.
  const { scrollY } = useScroll()
  const parallax = useTransform(scrollY, [0, 500], [0, 14])

  return (
    <Burbuja
      tono="aguaClara"
      entrada="ninguna"
      className="pb-28 pt-10 md:pb-36 md:pt-16"
      decoracion={
        <>
          {/* El agua se va profundizando hacia abajo, donde suben las olas. */}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-mar-celeste/25" />
          <Olas parallax={bucles ? parallax : undefined} />
          <Burbujitas />
        </>
      }
    >
      {/* El héroe se ve al instante: solo un fundido corto y escalonado del texto (<150ms). */}
      <motion.div
        variants={cascada(0.045)}
        initial="oculto"
        animate="visible"
        className="flex flex-col gap-4 md:items-center md:gap-6 md:text-center"
      >
        <motion.p variants={fundido} className="text-etiqueta uppercase text-mar-agua">
          Un gimnasio del alma
        </motion.p>
        <motion.h1
          variants={fundido}
          className="text-titulo-xl font-light"
        >
          No somos las olas.
          <br />
          Somos el océano.
        </motion.h1>
        <motion.p
          variants={fundido}
          className="text-destacado text-mar-tintaSuave md:max-w-parrafo"
        >
          Las emociones, los pensamientos y las circunstancias aparecen y desaparecen. Debajo de todo
          eso hay un espacio de paz que nunca se va. Acá se practica vivir desde esa profundidad.
        </motion.p>
        <motion.div variants={fundido} className="mt-2 flex flex-col gap-3 md:flex-row md:gap-4">
          <Boton to="/#ventanas">Ver las ventanas</Boton>
          <Boton to="/#propuesta" variante="secundario">
            Cómo funciona
          </Boton>
        </motion.div>
      </motion.div>
    </Burbuja>
  )
}
