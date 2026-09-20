import { useId, type SelectHTMLAttributes } from 'react'

type Opcion = { valor: string; texto: string }
type Props = SelectHTMLAttributes<HTMLSelectElement> & { etiqueta: string; opciones: Opcion[] }

// Lista desplegable con su <label> de verdad, asociado por id.
export default function Selector({ etiqueta, opciones, ...nativos }: Props) {
  const id = useId()

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[15px] font-medium text-mar-tinta">
        {etiqueta}
      </label>
      <select
        id={id}
        className="min-h-[48px] rounded-xl border border-mar-bordeAgua bg-mar-blanco px-3 text-base text-mar-tinta"
        {...nativos}
      >
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
    </div>
  )
}
