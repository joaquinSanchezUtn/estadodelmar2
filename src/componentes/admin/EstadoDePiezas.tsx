import type { TemaAdmin, TipoContenido } from '../../datos/tipos'
import { cn } from '../../lib/cn'

const nombres: Record<TipoContenido, string> = { video: 'Video', meditacion: 'Meditación', ejercitacion: 'Ejercitación' }
const tipos: TipoContenido[] = ['video', 'meditacion', 'ejercitacion']

// Cómo está cada una de las tres piezas de un tema, de un vistazo: publicada, en borrador, sin archivo o
// todavía sin crear. El color acompaña, pero el estado siempre va escrito.
export default function EstadoDePiezas({ tema }: { tema: TemaAdmin }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {tipos.map((tipo) => {
        const c = tema.contenidos.find((x) => x.tipo === tipo)
        const estado = !c ? 'Falta' : tipo !== 'ejercitacion' && !c.archivo ? 'Sin archivo' : c.publicado ? 'Publicada' : 'Borrador'
        return (
          <li
            key={tipo}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-meta',
              estado === 'Publicada' ? 'border-mar-primario bg-mar-primarioSuave text-mar-primario' : 'border-mar-bordeCielo bg-mar-blanco text-mar-tinta',
            )}
          >
            <span aria-hidden="true" className={cn('size-2 rounded-full', estado === 'Publicada' ? 'bg-mar-primario' : estado === 'Falta' ? 'bg-mar-tintaTenue' : 'bg-mar-coral')} />
            <span>
              <span className="font-bold">{nombres[tipo]}</span> · {estado}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
