import type { Contenido, TipoContenido } from '../../datos/tipos'
import { minutos } from '../../lib/formato'

const nombres: Record<TipoContenido, string> = {
  video: 'Video',
  meditacion: 'Meditación',
  ejercitacion: 'Ejercitación',
}

export default function ListaContenidos({ contenidos }: { contenidos: Contenido[] }) {
  return (
    <section aria-labelledby="titulo-contenidos">
      <h3 id="titulo-contenidos" className="mb-2 text-lg font-normal">
        Contenidos
      </h3>
      {contenidos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-mar-bordeAgua bg-mar-blanco/60 p-4 text-base text-mar-tintaSuave">
          Esta ventana todavía no tiene contenidos.
        </p>
      ) : (
        <ul className="divide-y divide-mar-bordeAgua rounded-xl border border-mar-bordeAgua bg-mar-blanco">
          {contenidos.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="flex flex-col">
                <span className="text-xs uppercase tracking-widest text-mar-tintaSuave">
                  {nombres[c.tipo]}
                </span>
                <span className="text-base text-mar-tinta">{c.titulo}</span>
              </span>
              <span className="shrink-0 text-[15px] text-mar-tintaSuave">
                {minutos(c.duracionMin)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
