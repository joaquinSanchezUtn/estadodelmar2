import { motion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode, Ref } from 'react'
import { Link } from 'react-router-dom'
import { presionar } from '../../animaciones/movimiento'
import { cn } from '../../lib/cn'

// Botón primario: celeste con texto tintaBoton; nunca texto claro encima.
const variantes = {
  primario:
    'border border-mar-celesteBorde bg-mar-celeste font-bold text-mar-tintaBoton shadow-tarjeta hover:brightness-95',
  secundario: 'border border-mar-celesteBorde bg-mar-blanco/40 font-medium text-mar-tinta hover:bg-mar-blanco/75',
  fantasma: 'font-medium text-mar-tintaSuave hover:bg-mar-tinta/5 hover:text-mar-tinta',
}

// Las clases de un botón, para lo que no es un <button> ni un <a> pero tiene que verse como uno
// (por ejemplo el <label> que abre el selector de archivos). Un solo lugar define cómo se ve un botón.
export const clasesBoton = (variante: keyof typeof variantes = 'primario', compacto = false) =>
  cn(
    'inline-flex items-center justify-center rounded-full text-center text-cuerpo no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-50',
    compacto ? 'min-h-control-sm px-5' : 'min-h-control px-8',
    variantes[variante],
  )

const AnclaMovil = motion.create(Link)

type Comun = {
  variante?: keyof typeof variantes
  compacto?: boolean
  className?: string
  children: ReactNode
}
// Navegar es un <a> (con `to`); una acción es un <button>. Ambos se hunden al tocarlos.
type ComoEnlace = Comun & { to: string; onClick?: () => void }
type ComoAccion = Comun &
  Omit<HTMLMotionProps<'button'>, 'className' | 'children' | 'ref'> & { ref?: Ref<HTMLButtonElement> }

export default function Boton(props: ComoEnlace | ComoAccion) {
  const { variante = 'primario', compacto = false, className, children } = props
  const clases = cn(clasesBoton(variante, compacto), className)

  if ('to' in props) {
    return (
      <AnclaMovil to={props.to} onClick={props.onClick} whileTap={presionar} className={clases}>
        {children}
      </AnclaMovil>
    )
  }

  const { variante: _v, compacto: _c, className: _cl, children: _ch, type = 'button', ...nativos } = props
  return (
    <motion.button type={type} whileTap={presionar} className={clases} {...nativos}>
      {children}
    </motion.button>
  )
}
