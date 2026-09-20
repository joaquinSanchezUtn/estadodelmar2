import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { RADIO_OJO_DE_BUEY, encender, gestos, idVentana, presionar, transicionLayout, useMovimiento } from '../../animaciones/movimiento'
import type { Tema } from '../../datos/tipos'
import { cn } from '../../lib/cn'
import { resumenPiezas } from '../../lib/formato'
import DibujoEstado from '../objetos/DibujoEstado'
import { coloresDe } from '../objetos/estados/colores'
import ReflejoVidrio from './ReflejoVidrio'
import Relleno from './Relleno'
import VidrioEsmerilado from './VidrioEsmerilado'

const AnclaMovil = motion.create(Link)
const forma = { borderRadius: RADIO_OJO_DE_BUEY }

type Props = { tema: Tema; estadoNombre?: string; bloqueada: boolean }

// Una ventana de verdad: un ojo de buey que da a un mar distinto según el tema. Es un <a>,
// así el teclado lo alcanza y se abre en otra pestaña. El agua de adentro va tintada con el
// color del estado (nunca blanca) y el marco lleva un aro oscuro de 3px y otro claro de 1px por
// fuera. En reposo el agua se mueve muy lento; al enfocar (hover o foco) la burbuja se eleva,
// el aro se aclara y el agua se agita.
export default function OjoDeBuey({ tema, estadoNombre, bloqueada }: Props) {
  const { reducido } = useMovimiento()
  const c = coloresDe(tema.estadoMar)

  return (
    <AnclaMovil
      to={`/tema/${tema.slug}`}
      variants={gestos}
      initial="reposo"
      animate="reposo"
      whileHover="enfocar"
      whileFocus="enfocar"
      whileTap={presionar}
      className="flex flex-col items-center gap-3 rounded-burbuja text-center text-mar-tinta no-underline outline-offset-4"
    >
      <span className="relative block aspect-square w-full max-w-ojo">
        {/* Sombra abierta al enfocar: capa aparte que solo cambia de opacidad. */}
        <motion.span aria-hidden="true" variants={encender} style={forma} className="absolute inset-0 shadow-ojoFoco" />
        {/* La cáscara es lo único que se comparte con la cabecera del tema. La cara, el agua y los
            aros van aparte para que no se deformen mientras la burbuja crece. */}
        <motion.span
          layoutId={reducido ? undefined : idVentana(tema.slug)}
          transition={{ layout: transicionLayout }}
          style={forma}
          className="absolute inset-0 bg-mar-espuma shadow-ojo"
        />
        {/* La cara de la ventana: el agua tintada con el color del estado. Lo que se atenúa
            en una ventana de pago es siempre este dibujo decorativo, nunca contenido real. */}
        <span className={cn('absolute inset-0 overflow-hidden', c.agua)} style={forma}>
          <Relleno estado={tema.estadoMar} />
          {bloqueada ? <VidrioEsmerilado estado={tema.estadoMar} /> : <DibujoEstado estado={tema.estadoMar} />}
          <ReflejoVidrio />
        </span>
        {/* Aro oscuro de 3px con un anillo claro de 1px por fuera, y un poco de profundidad adentro. */}
        <span
          aria-hidden="true"
          style={forma}
          className={cn('pointer-events-none absolute inset-0 border-3 shadow-ventana ring-1', c.aro, c.aroExterior)}
        />
        {/* Al enfocar el aro se aclara. */}
        <motion.span
          aria-hidden="true"
          variants={encender}
          style={forma}
          className={cn('pointer-events-none absolute inset-0 border-3 opacity-70', c.aroClaro)}
        />
      </span>
      <span className="flex flex-col gap-1">
        {estadoNombre && (
          <span className="text-etiqueta uppercase text-mar-tintaSuave">{estadoNombre}</span>
        )}
        <span className="font-titulo text-titulo-s">{tema.titulo}</span>
        <span className="text-meta text-mar-tintaSuave">{resumenPiezas(tema.piezas)}</span>
      </span>
    </AnclaMovil>
  )
}
