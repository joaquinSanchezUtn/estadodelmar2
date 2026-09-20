import clsx from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

// El texto del botón primario es #2A3E45 sobre arena; nunca texto claro.
const variantes = {
  primario: 'bg-mar-arena font-bold text-[#2A3E45] hover:brightness-95',
  secundario: 'border border-mar-aguaSuave/70 text-mar-tinta hover:bg-mar-blanco/60',
  fantasma: 'text-mar-tintaSuave hover:bg-mar-tinta/5 hover:text-mar-tinta',
}

type Comun = {
  variante?: keyof typeof variantes
  compacto?: boolean
  className?: string
  children: ReactNode
}
// Navegar es un <a> (con `to`); una acción es un <button>.
type ComoEnlace = Comun & { to: string; onClick?: () => void }
type ComoAccion = Comun & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>

export default function Boton(props: ComoEnlace | ComoAccion) {
  const { variante = 'primario', compacto = false, className, children } = props
  const clases = clsx(
    'inline-flex items-center justify-center rounded-full text-center no-underline transition disabled:cursor-not-allowed disabled:opacity-50',
    compacto ? 'min-h-[44px] px-5 text-[15px]' : 'min-h-[48px] px-8 text-base',
    variantes[variante],
    className,
  )

  if ('to' in props) {
    return (
      <Link to={props.to} onClick={props.onClick} className={clases}>
        {children}
      </Link>
    )
  }

  const { variante: _v, compacto: _c, className: _cl, children: _ch, type = 'button', ...nativos } = props
  return (
    <button type={type} className={clases} {...nativos}>
      {children}
    </button>
  )
}
