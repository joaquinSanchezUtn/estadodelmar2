import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  etiqueta: string
  ayuda?: string
  error?: string
  // Botón o ícono que va adentro del campo, a la derecha (por ejemplo, mostrar la contraseña).
  derecha?: ReactNode
}

// Input con su <label> de verdad, asociado por id.
export default function Campo({ etiqueta, ayuda, error, derecha, className, ...nativos }: Props) {
  const id = useId()
  const idAyuda = `${id}-ayuda`
  const idError = `${id}-error`

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-cuerpo font-medium text-mar-tinta">
        {etiqueta}
      </label>
      <div className="relative flex flex-col">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={[ayuda && !error && idAyuda, error && idError].filter(Boolean).join(' ') || undefined}
          className={
            'min-h-control rounded-control border bg-mar-blanco px-4 text-cuerpo text-mar-tinta placeholder:text-mar-tintaSuave ' +
            (error ? 'border-mar-coral' : 'border-mar-bordeControl') +
            (derecha ? ' pr-14' : '') +
            (className ? ` ${className}` : '')
          }
          {...nativos}
        />
        {derecha && <span className="absolute inset-y-0 right-0 flex items-center">{derecha}</span>}
      </div>
      {ayuda && !error && (
        <p id={idAyuda} className="text-meta text-mar-tintaSuave">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={idError} className="text-meta text-mar-coral">
          {error}
        </p>
      )}
    </div>
  )
}
