import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { RADIO_OJO_DE_BUEY, encender, gestos, idVentana, presionar, transicionLayout, useMovimiento } from '../../animaciones/movimiento'
import type { Tema } from '../../datos/tipos'
import DibujoEstado from '../objetos/DibujoEstado'
import VidrioEsmerilado from './VidrioEsmerilado'

const AnclaMovil = motion.create(Link)
const forma = { borderRadius: RADIO_OJO_DE_BUEY }

type Props = { tema: Tema; estadoNombre?: string; bloqueada: boolean }

// Una ventana de verdad: un ojo de buey que da a un mar distinto según el tema. Es un <a>,
// así el teclado lo alcanza y se abre en otra pestaña. En reposo el agua se mueve muy lento;
// al enfocar (hover o foco) la burbuja se eleva, el borde se aclara y el agua se agita.
export default function OjoDeBuey({ tema, estadoNombre, bloqueada }: Props) {

  const { reducido } = useMovimiento()
  const agua = <DibujoEstado estado={tema.estadoMar} className="text-mar-agua" />

  return (
    <AnclaMovil
      to={`/tema/${tema.slug}`}
      variants={gestos}
      initial="reposo"
      animate="reposo"
      whileHover="enfocar"
      whileFocus="enfocar"
      whileTap={presionar}
      className="flex flex-col items-center gap-3 rounded-3xl text-center text-mar-tinta no-underline outline-offset-4"
    >
      <span className="relative block aspect-square w-full max-w-[240px]">
        {/* Sombra abierta al enfocar: capa aparte que solo cambia de opacidad. */}
        <motion.span
          aria-hidden="true"
          variants={encender}
          style={forma}
          className="absolute inset-0 shadow-[0_18px_50px_-12px_rgba(30,58,76,0.35)]"
        />
        {/* La cáscara es lo único que se comparte con la cabecera del tema. El agua va aparte
            para que no se deforme mientras la burbuja crece. */}
        <motion.span
          layoutId={reducido ? undefined : idVentana(tema.slug)}
          transition={{ layout: transicionLayout }}
          style={forma}
          className="absolute inset-0 border border-mar-bordeAgua bg-mar-blanco shadow-burbuja"
        />
        <span className="absolute inset-0 overflow-hidden" style={forma}>
          {bloqueada ? <VidrioEsmerilado estado={tema.estadoMar} /> : agua}
        </span>
        {/* Borde que se aclara al enfocar. */}
        <motion.span
          aria-hidden="true"
          variants={encender}
          style={forma}
          className="pointer-events-none absolute inset-0 border-2 border-mar-blanco"
        />
      </span>
      <span className="flex flex-col gap-1">
        {estadoNombre && (
          <span className="text-xs uppercase tracking-widest text-mar-tintaSuave">{estadoNombre}</span>
        )}
        <span className="font-titulo text-xl">{tema.titulo}</span>
      </span>
    </AnclaMovil>
  )
}
