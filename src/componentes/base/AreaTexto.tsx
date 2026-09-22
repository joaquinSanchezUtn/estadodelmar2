import clsx from 'clsx'
import { useId, type TextareaHTMLAttributes } from 'react'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & { etiqueta: string; ayuda?: string }

// Área de texto con su <label> de verdad, asociado por id.
export default function AreaTexto({ etiqueta, ayuda, className, ...nativos }: Props) {
  const id = useId()

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-cuerpo font-medium text-mar-tinta">
        {etiqueta}
      </label>
      <textarea
        id={id}
        aria-describedby={ayuda ? `${id}-ayuda` : undefined}
        className={clsx(
          'w-full resize-y rounded-control border border-mar-bordeControl bg-mar-blanco p-3 text-cuerpo text-mar-tinta placeholder:text-mar-tintaSuave',
          className,
        )}
        {...nativos}
      />
      {ayuda && (
        <p id={`${id}-ayuda`} className="text-meta text-mar-tintaSuave">
          {ayuda}
        </p>
      )}
    </div>
  )
}
