import { motion } from 'motion/react'
import { useSesion } from '../../auth/SesionContext'
import { cascada, fundido } from '../../animaciones/movimiento'
import { portadaInicial } from '../../datos/portada'
import type { TextosDePortada } from '../../datos/tipos'
import Boton from '../base/Boton'
import { cn } from '../../lib/cn'
import IlustracionHeroe from './IlustracionHeroe'

// Solo lo que es cierto hoy: nada de cifras ni credenciales que no estén cargadas.
const confianza = ['Cancelás cuando quieras', 'Pago seguro con Mercado Pago', 'En el celular o la compu']

// El héroe: qué es, para quién, y por dónde empezar. A la derecha, el emblema. Los textos los edita la
// dueña (/admin/portada); mientras cargan, los de siempre reservan el lugar sin verse (así no salta nada) y
// el bloque se vuelve a montar con los reales, para que la entrada se anime con ellos.
// Quien no tiene cuenta no ve un botón principal acá (el encabezado ya tiene «Empezar»): sacado a pedido
// de Joaquin el 2026-10-06.
export default function Portada({ textos }: { textos: TextosDePortada | null }) {
  const { rol, accesoActivo } = useSesion()
  const t = textos ?? portadaInicial
  const principal = accesoActivo ? { to: '/ventanas', texto: 'Ir a los temas' } : rol === 'visitante' ? null : { to: '/mi-cuenta', texto: 'Suscribirme' }

  return (
    <section className="grid items-center gap-8 pb-6 pt-4 md:gap-12 md:pt-10 lg:grid-cols-2">
      <motion.div
        key={textos ? 'listo' : 'cargando'}
        variants={cascada(0.05)}
        initial="oculto"
        animate="visible"
        aria-hidden={textos ? undefined : true}
        className={cn('flex flex-col items-start', !textos && 'invisible')}
      >
        {t.etiqueta && (
          <motion.p variants={fundido} className="mb-5 rounded-full bg-mar-primarioSuave px-4 py-1 text-meta font-bold text-mar-primario">
            {t.etiqueta}
          </motion.p>
        )}
        {/* El título va en degradé, del azul oscuro del primer renglón al azul claro del segundo (pedido de Joaquin). */}
        <motion.h1 variants={fundido} className="mb-5 bg-gradient-to-b from-mar-tituloOscuro to-mar-tituloClaro bg-clip-text text-titulo-xl text-transparent">
          {t.titulo}
          {t.tituloDestacado && (
            <>
              <br />
              {t.tituloDestacado}
            </>
          )}
        </motion.h1>
        {t.texto && (
          <motion.p variants={fundido} className="mb-8 max-w-parrafo text-destacado text-mar-tintaSuave">
            {t.texto}
          </motion.p>
        )}
        <motion.div variants={fundido} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {principal && <Boton to={principal.to}>{principal.texto}</Boton>}
          <Boton to="/#estados" variante={principal ? 'secundario' : 'primario'}>
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
