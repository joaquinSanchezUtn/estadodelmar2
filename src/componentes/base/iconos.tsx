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

export const IconoCandado = ({ className = 'h-4 w-4' }: Props) => (
  <Svg className={className}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Svg>
)

export const Cuenta = ({ className = 'size-6' }: Props) => (
  <Svg className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Svg>
)

export const Ojo = ({ className = 'size-5' }: Props) => (
  <Svg className={className}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
)

export const OjoTachado = ({ className = 'size-5' }: Props) => (
  <Svg className={className}>
    <path d="M9.9 5.2A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a10 10 0 0 0 5.4-1.6M3 3l18 18" />
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

export const Pausa = ({ className = 'size-5' }: Props) => (
  <Svg className={className}>
    <path d="M8 5v14M16 5v14" />
  </Svg>
)

export const Volumen = ({ className = 'size-5' }: Props) => (
  <Svg className={className}>
    <path d="M4 9v6h4l5 4V5L8 9H4ZM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
  </Svg>
)

export const Silenciado = ({ className = 'size-5' }: Props) => (
  <Svg className={className}>
    <path d="M4 9v6h4l5 4V5L8 9H4ZM17 9l5 6M22 9l-5 6" />
  </Svg>
)

export const Expandir = ({ className = 'size-5' }: Props) => (
  <Svg className={className}>
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </Svg>
)

export const Arriba = ({ className = 'size-5' }: Props) => (
  <Svg className={className}>
    <path d="m6 15 6-6 6 6" />
  </Svg>
)

export const Abajo = ({ className = 'size-5' }: Props) => (
  <Svg className={className}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
)

export const Ondas = ({ className = 'h-6 w-6' }: Props) => (
  <Svg className={className}>
    <path d="M2 8c2-3 4-3 6 0s4 3 6 0 4-3 6 0M2 16c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
  </Svg>
)

export const Lapiz = ({ className = 'h-6 w-6' }: Props) => (
  <Svg className={className}>
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </Svg>
)

// Logo de Google: es una marca, por eso conserva sus colores.
export const Google = ({ className = 'h-5 w-5' }: Props) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
)
