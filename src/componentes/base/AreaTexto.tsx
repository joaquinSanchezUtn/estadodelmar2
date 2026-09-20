import clsx from 'clsx'
import { useId, type TextareaHTMLAttributes } from 'react'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & { etiqueta: string; ayuda?: string }

// Área de texto con su <label> de verdad, asociado por id.
export default function AreaTexto({ etiqueta, ayuda, className, ...nativos }: Props) {
  const id = useId()

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[15px] font-medium text-mar-tinta">
        {etiqueta}
      </label>
      <textarea
        id={id}
        aria-describedby={ayuda ? `${id}-ayuda` : undefined}
        className={clsx(
          'w-full resize-y rounded-xl border border-mar-bordeAgua bg-mar-blanco p-3 text-base text-mar-tinta placeholder:text-mar-tintaSuave',
          className,
        )}
        {...nativos}
      />
      {ayuda && (
        <p id={`${id}-ayuda`} className="text-sm text-mar-tintaSuave">
          {ayuda}
        </p>
      )}
    </div>
  )
}
