import { motion } from 'motion/react'
import { cascada, emerger, viewportUnaVez } from '../../animaciones/movimiento'
import type { TextosDePortada } from '../../datos/tipos'
import Seccion from './Seccion'

// El recorrido de cada tema, en pasos numerados: para que se entienda de un vistazo qué se hace acá. Los
// textos y las tarjetas los edita la dueña (/admin/portada); el número sale del orden. Sin tarjetas, no va.
// Se monta recién con los textos cargados: una lista con `whileInView` que se llena después nace oculta.
export default function ComoFunciona({ textos }: { textos: TextosDePortada }) {
  if (textos.pasos.length === 0) return null
  return (
    <Seccion id="como-funciona" titulo={textos.comoTitulo} texto={textos.comoTexto ?? undefined}>
      <motion.ol
        variants={cascada(0.08)}
        initial="oculto"
        whileInView="visible"
        viewport={viewportUnaVez}
        className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4 md:gap-5"
      >
        {textos.pasos.map((p, i) => (
          <motion.li key={i} variants={emerger} className="rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-6 shadow-suave">
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
