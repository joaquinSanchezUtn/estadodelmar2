import type { TemaAdmin, TipoContenido } from '../../datos/tipos'
import { cn } from '../../lib/cn'

const nombres: Record<TipoContenido, string> = { video: 'Video', meditacion: 'Meditación', ejercitacion: 'Ejercitación' }
const tipos: TipoContenido[] = ['video', 'meditacion', 'ejercitacion']

// Cómo está cada pieza que el tema tiene, de un vistazo: publicada, en borrador o sin archivo. Las que no
// tiene no se nombran: no todo tema lleva meditación o ejercitación (pedido de Joaquin, 2026-11-15).
// El color acompaña, pero el estado siempre va escrito.
export default function EstadoDePiezas({ tema }: { tema: TemaAdmin }) {
  const piezas = tipos.flatMap((tipo) => tema.contenidos.filter((x) => x.tipo === tipo))
  if (piezas.length === 0) return <p className="text-meta text-mar-tintaSuave">Todavía sin piezas.</p>
  return (
    <ul className="flex flex-wrap gap-2">
      {piezas.map((c) => {
        const tipo = c.tipo
        const estado = tipo !== 'ejercitacion' && !c.archivo ? 'Sin archivo' : c.publicado ? 'Publicada' : 'Borrador'
        return (
          <li
            key={c.id}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-meta',
              estado === 'Publicada' ? 'border-mar-primario bg-mar-primarioSuave text-mar-primario' : 'border-mar-bordeCielo bg-mar-blanco text-mar-tinta',
            )}
          >
            <span aria-hidden="true" className={cn('size-2 rounded-full', estado === 'Publicada' ? 'bg-mar-primario' : 'bg-mar-coral')} />
            <span>
              <span className="font-bold">{nombres[tipo]}</span> · {estado}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
