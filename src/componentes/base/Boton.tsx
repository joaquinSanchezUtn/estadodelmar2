import { motion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode, Ref } from 'react'
import { Link } from 'react-router-dom'
import { presionar } from '../../animaciones/movimiento'
import { cn } from '../../lib/cn'

// Botón primario: celeste con texto tintaBoton; nunca texto claro encima.
const variantes = {
  primario: 'bg-mar-celeste font-bold text-mar-tintaBoton hover:brightness-95',
  secundario: 'border border-mar-aguaSuave/70 text-mar-tinta hover:bg-mar-blanco/60',
  fantasma: 'text-mar-tintaSuave hover:bg-mar-tinta/5 hover:text-mar-tinta',
}

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
  const clases = cn(
    'inline-flex items-center justify-center rounded-full text-center no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-50',
    compacto ? 'min-h-[44px] px-5 text-[15px]' : 'min-h-[48px] px-8 text-base',
    variantes[variante],
    className,
  )

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
