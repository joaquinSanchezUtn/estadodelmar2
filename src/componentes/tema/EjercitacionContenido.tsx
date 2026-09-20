import { useId, useState } from 'react'
import type { Contenido } from '../../datos/tipos'
import { minutos } from '../../lib/formato'

export default function EjercitacionContenido({ contenido }: { contenido: Contenido }) {
  const id = useId()
  // Las notas viven solo en esta pantalla: guardar historial está fuera de alcance.
  const [notas, setNotas] = useState('')

  return (
    <div className="rounded-[13px] border border-mar-bordeAgua bg-mar-blanco p-5 md:p-6">
      <p className="mb-1 text-xs uppercase tracking-[0.16em] text-mar-agua">
        Ejercitación · {minutos(contenido.duracionMin)}
      </p>
      <h2 className="mb-3 text-xl font-normal">{contenido.titulo}</h2>
      {contenido.cuerpo && (
        <p className="mb-5 text-base leading-relaxed text-mar-tinta">{contenido.cuerpo}</p>
      )}
      <label htmlFor={id} className="mb-1.5 block text-[15px] font-medium text-mar-tinta">
        Tus notas
      </label>
      <textarea
        id={id}
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        rows={4}
        aria-describedby={`${id}-ayuda`}
        className="w-full resize-y rounded-xl border border-mar-bordeAgua bg-mar-marfil p-3 text-base text-mar-tinta placeholder:text-mar-tintaSuave"
        placeholder="Escribí acá lo que vayas notando…"
      />
      <p id={`${id}-ayuda`} className="mt-1.5 text-sm text-mar-tintaSuave">
        Tus notas quedan solo en esta pantalla.
      </p>
    </div>
  )
}
