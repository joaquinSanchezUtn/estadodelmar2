import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

// El texto del botón primario es #2A3E45 sobre arena; nunca texto claro.
const variantes = {
  primario: 'bg-mar-arena font-bold text-[#2A3E45] hover:brightness-95',
  secundario: 'border border-mar-aguaSuave/70 text-mar-tinta hover:bg-mar-blanco/60',
  texto: 'text-mar-tintaSuave hover:text-mar-tinta',
}

type Props = {
  to: string
  variante?: keyof typeof variantes
  compacto?: boolean
  className?: string
  onClick?: () => void
  children: ReactNode
}

export default function Boton({
  to,
  variante = 'primario',
  compacto = false,
  className,
  onClick,
  children,
}: Props) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={clsx(
        'inline-flex items-center justify-center rounded-full text-center no-underline transition',
        compacto ? 'min-h-[44px] px-5 text-[15px]' : 'min-h-[48px] px-8 text-base',
        variantes[variante],
        className,
      )}
    >
      {children}
    </Link>
  )
}
