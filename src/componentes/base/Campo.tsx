import { useId, type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  etiqueta: string
  ayuda?: string
  error?: string
}

// Input con su <label> de verdad, asociado por id.
export default function Campo({ etiqueta, ayuda, error, className, ...nativos }: Props) {
  const id = useId()
  const idAyuda = `${id}-ayuda`
  const idError = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[15px] font-medium text-mar-tinta">
        {etiqueta}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={[ayuda && idAyuda, error && idError].filter(Boolean).join(' ') || undefined}
        className={
          'min-h-[48px] rounded-xl border bg-mar-blanco px-4 text-base text-mar-tinta placeholder:text-mar-tintaSuave ' +
          (error ? 'border-mar-arenaOscura' : 'border-mar-bordeAgua') +
          (className ? ` ${className}` : '')
        }
        {...nativos}
      />
      {ayuda && (
        <p id={idAyuda} className="text-sm text-mar-tintaSuave">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={idError} className="text-sm text-mar-arenaOscura">
          {error}
        </p>
      )}
    </div>
  )
}
