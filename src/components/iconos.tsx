import type { ReactNode } from 'react'

type Props = { className?: string }

function Svg({ className, children }: Props & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const Candado = ({ className = 'h-4 w-4' }: Props) => (
  <Svg className={className}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Svg>
)

export const Menu = ({ className = 'h-6 w-6' }: Props) => (
  <Svg className={className}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </Svg>
)

export const Cerrar = ({ className = 'h-6 w-6' }: Props) => (
  <Svg className={className}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
)

export const FlechaIzquierda = ({ className = 'h-4 w-4' }: Props) => (
  <Svg className={className}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
)

export const Check = ({ className = 'h-4 w-4' }: Props) => (
  <Svg className={className}>
    <path d="M20 6L9 17l-5-5" />
  </Svg>
)

export const Play = ({ className = 'h-5 w-5' }: Props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
)
