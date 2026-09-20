import { useState } from 'react'
import type { Contenido } from '../../datos/tipos'
import { minutos } from '../../lib/formato'
import AreaTexto from '../base/AreaTexto'

export default function EjercitacionContenido({ contenido }: { contenido: Contenido }) {
  // Las notas viven solo en esta pantalla: guardar historial está fuera de alcance.
  const [notas, setNotas] = useState('')

  return (
    <div className="rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-5 md:p-6">
      <p className="mb-1 text-etiqueta uppercase text-mar-agua">
        Ejercitación · {minutos(contenido.duracionMin)}
      </p>
      <h2 className="mb-3 text-titulo-s font-normal">{contenido.titulo}</h2>
      {contenido.cuerpo && <p className="mb-5 text-cuerpo text-mar-tinta">{contenido.cuerpo}</p>}
      <AreaTexto
        etiqueta="Tus notas"
        ayuda="Tus notas quedan solo en esta pantalla."
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        rows={4}
        placeholder="Escribí acá lo que vayas notando…"
      />
    </div>
  )
}
