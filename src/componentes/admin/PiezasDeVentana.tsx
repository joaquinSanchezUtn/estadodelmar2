import { Link } from 'react-router-dom'
import type { TemaAdmin, TipoContenido } from '../../datos/tipos'
import { minutos } from '../../lib/formato'
import Boton from '../base/Boton'
import Sello from '../base/Sello'

const nombres: Record<TipoContenido, string> = { video: 'Video psicoeducativo', meditacion: 'Meditación', ejercitacion: 'Ejercitación' }
const todos: TipoContenido[] = ['video', 'meditacion', 'ejercitacion']

// Las piezas de la ventana: se abre cada una para editarla y se agregan las que faltan (una de cada tipo).
export default function PiezasDeVentana({ tema }: { tema: TemaAdmin }) {
  const faltan = todos.filter((t) => !tema.contenidos.some((c) => c.tipo === t))

  return (
    <section aria-labelledby="piezas-titulo" className="flex flex-col gap-4 rounded-tarjeta border border-mar-bordeAgua bg-mar-blanco p-5 md:p-6">
      <h2 id="piezas-titulo" className="text-titulo-s font-normal">
        Piezas
      </h2>

      {tema.contenidos.length === 0 ? (
        <p className="text-cuerpo text-mar-tintaSuave">Esta ventana todavía no tiene piezas. Agregá un video, una meditación o una ejercitación.</p>
      ) : (
        <ul className="divide-y divide-mar-bordeAgua rounded-tarjeta border border-mar-bordeAgua">
          {tema.contenidos.map((c) => (
            <li key={c.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-etiqueta uppercase text-mar-tintaSuave">{nombres[c.tipo]}</p>
                <Link to={`/admin/ventanas/${tema.slug}/contenidos/${c.id}`} className="inline-flex min-h-control-sm items-center text-cuerpo text-mar-tinta hover:underline">
                  {c.titulo}
                </Link>
                <p className="text-meta text-mar-tintaSuave">{minutos(c.duracionMin) || 'Sin duración'}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Sello tono={c.publicado ? 'agua' : 'coral'}>{c.publicado ? 'Publicada' : 'Borrador'}</Sello>
                {c.tipo !== 'ejercitacion' && <Sello tono={c.archivo ? 'agua' : 'coral'}>{c.archivo ? 'Con archivo' : 'Sin archivo'}</Sello>}
                <Boton compacto variante="secundario" to={`/admin/ventanas/${tema.slug}/contenidos/${c.id}`}>
                  Editar
                </Boton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {faltan.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {faltan.map((t) => (
            <Boton key={t} compacto variante="secundario" to={`/admin/ventanas/${tema.slug}/contenidos/nuevo?tipo=${t}`}>
              Agregar {nombres[t].toLowerCase()}
            </Boton>
          ))}
        </div>
      )}
    </section>
  )
}
