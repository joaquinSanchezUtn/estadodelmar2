import { motion } from 'motion/react'
import { useSesion } from '../../auth/SesionContext'
import { cascada, fundido } from '../../animaciones/movimiento'
import Boton from '../base/Boton'
import IlustracionHeroe from './IlustracionHeroe'

// Solo lo que es cierto hoy: nada de cifras ni credenciales que no estén cargadas.
const confianza = ['Cancelás cuando quieras', 'Pago seguro con Mercado Pago', 'En el celular o la compu']

// El héroe: qué es, para quién, y por dónde empezar. A la derecha, el mar al atardecer.
export default function Portada() {
  const { rol, accesoActivo } = useSesion()
  const principal = accesoActivo
    ? { to: '/ventanas', texto: 'Ir a los temas' }
    : rol === 'visitante'
      ? { to: '/registrarme', texto: 'Empezar ahora' }
      : { to: '/mi-cuenta', texto: 'Suscribirme' }

  return (
    <section className="grid items-center gap-8 pb-6 pt-4 md:gap-12 md:pt-10 lg:grid-cols-2">
      <motion.div variants={cascada(0.05)} initial="oculto" animate="visible" className="flex flex-col items-start">
        <motion.p variants={fundido} className="mb-5 rounded-full bg-mar-primarioSuave px-4 py-1 text-meta font-bold text-mar-primario">
          Un gimnasio del alma
        </motion.p>
        <motion.h1 variants={fundido} className="mb-5 text-titulo-xl">
          No somos las olas.
          <br />
          <span className="text-mar-primario">Somos el océano.</span>
        </motion.h1>
        <motion.p variants={fundido} className="mb-8 max-w-parrafo text-destacado text-mar-tintaSuave">
          Videos, meditaciones y ejercicios para atravesar la ansiedad, los duelos y los cambios sin perder el centro. A tu ritmo,
          desde cualquier lugar.
        </motion.p>
        <motion.div variants={fundido} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Boton to={principal.to}>{principal.texto}</Boton>
          <Boton to="/#estados" variante="secundario">
            ¿Cómo está tu mar hoy?
          </Boton>
        </motion.div>
        <motion.ul variants={fundido} className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-meta font-medium text-mar-tintaSuave">
          {confianza.map((c) => (
            <li key={c} className="flex items-center gap-2">
              <span aria-hidden="true" className="font-bold text-mar-primario">
                ✓
              </span>
              {c}
            </li>
          ))}
        </motion.ul>
      </motion.div>
      <IlustracionHeroe />
    </section>
  )
}
