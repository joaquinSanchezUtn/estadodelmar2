import { useEffect, useRef } from 'react'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'

type Props = {
  titulo: string
  texto: string
  confirmar: string
  pendiente: boolean
  error: string | null
  onConfirmar: () => void
  onCancelar: () => void
}

// Confirmación en la misma pantalla para lo que no se deshace. El foco va al título al abrirse y
// Escape cancela (salvo con la acción en curso).
export default function ConfirmarAccion({ titulo, texto, confirmar, pendiente, error, onConfirmar, onCancelar }: Props) {
  const encabezado = useRef<HTMLHeadingElement>(null)
  useEffect(() => encabezado.current?.focus(), [])

  return (
    <div
      role="alertdialog"
      aria-labelledby="confirmar-titulo"
      aria-describedby="confirmar-texto"
      onKeyDown={(e) => e.key === 'Escape' && !pendiente && onCancelar()}
      className="rounded-tarjeta border border-mar-coral/60 bg-mar-blanco p-5"
    >
      <h3 id="confirmar-titulo" ref={encabezado} tabIndex={-1} className="mb-2 text-titulo-s font-normal">
        {titulo}
      </h3>
      <p id="confirmar-texto" className="text-cuerpo text-mar-tintaSuave">
        {texto}
      </p>
      {error && <Aviso className="mt-4">{error}</Aviso>}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Boton onClick={onConfirmar} disabled={pendiente} aria-busy={pendiente}>
          {pendiente ? 'Un momento…' : confirmar}
        </Boton>
        <Boton variante="secundario" onClick={onCancelar} disabled={pendiente}>
          Cancelar
        </Boton>
      </div>
    </div>
  )
}
