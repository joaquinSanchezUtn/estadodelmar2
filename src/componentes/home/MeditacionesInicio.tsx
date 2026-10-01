import { Link } from 'react-router-dom'
import type { Tema } from '../../datos/tipos'
import { minutos } from '../../lib/formato'

// La franja nocturna: las meditaciones publicadas (una por tema, sale de `temas.piezas`, lo público) en
// una fila que se desliza de costado. Es el único fondo oscuro del sitio, a propósito: la noche invita a
// bajar el ritmo. Mientras no haya ninguna publicada, lo dice en vez de mostrar tarjetas vacías.
export default function MeditacionesInicio({ temas }: { temas: Tema[] | null }) {
  const con = temas?.flatMap((t) => t.piezas.filter((p) => p.tipo === 'meditacion').map((p) => ({ tema: t, duracion: p.duracionMin }))) ?? []

  return (
    <section id="meditaciones" className="relative my-6 scroll-mt-24 overflow-hidden rounded-burbujaGrande bg-gradient-to-b from-mar-noche to-mar-nocheProfunda px-5 py-10 text-mar-sobreNoche md:my-10 md:px-10 md:py-12">
      <div className="mx-auto mb-8 flex max-w-parrafo flex-col items-center gap-2 text-center md:mb-10">
        <div>
          <h2 className="text-titulo-m text-mar-sobreNoche md:text-titulo-l">Meditaciones</h2>
          <p className="mt-2 text-destacado text-mar-sobreNocheSuave">
            Para volver a la profundidad cuando la superficie está agitada, o para quedarse un rato ahí aunque esté en calma.
          </p>
        </div>
        <Link to="/meditaciones" className="inline-flex min-h-control-sm shrink-0 items-center font-bold text-mar-sobreNoche no-underline hover:underline">
          Ver todas →
        </Link>
      </div>

      {con.length === 0 ? (
        <p className="mx-auto max-w-parrafo rounded-burbuja border border-mar-sobreNoche/20 bg-mar-sobreNoche/5 p-5 text-center text-cuerpo text-mar-sobreNocheSuave">
          Las meditaciones guiadas se van sumando con cada tema. Muy pronto vas a encontrarlas acá.
        </p>
      ) : (
        <ul className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:justify-center md:px-0">
          {con.map(({ tema, duracion }) => (
            <li key={tema.id} className="w-64 shrink-0">
              <Link to={`/tema/${tema.slug}`} className="flex h-full flex-col gap-3 rounded-burbuja border border-mar-sobreNoche/15 bg-mar-sobreNoche/5 p-5 text-mar-sobreNoche no-underline transition-colors hover:bg-mar-sobreNoche/10">
                <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-mar-sobreNoche">
                  <span className="ml-1 border-y-4 border-l-8 border-y-transparent border-l-mar-noche" />
                </span>
                <span className="font-titulo text-titulo-s">{tema.titulo}</span>
                <span className="text-meta font-medium text-mar-sobreNocheSuave">Meditación guiada{duracion ? ` · ${minutos(duracion)}` : ''}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
