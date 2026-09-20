import type { ReactNode } from 'react'
import Aviso from '../base/Aviso'
import Burbuja from '../base/Burbuja'
import Pagina from '../layout/Pagina'

export type Seccion = { id: string; titulo: string; parrafos: ReactNode[] }

type Props = { titulo: string; actualizado: string; secciones: Seccion[] }

// Un documento legal: aviso de borrador, índice y cláusulas numeradas. El texto es provisorio y
// tiene que revisarlo alguien con criterio legal antes de publicarse; los datos que faltan van entre [corchetes].
export default function PaginaLegal({ titulo, actualizado, secciones }: Props) {
  return (
    <Pagina ancho="lectura">
      <Burbuja tono="blanco" entrada="ninguna" interior="flex flex-col gap-8">
        <div>
          <h1 className="mb-2 text-titulo-m font-light md:text-titulo-l">{titulo}</h1>
          <p className="text-cuerpo text-mar-tintaSuave">Última actualización: {actualizado}</p>
        </div>

        <Aviso tono="info">
          <strong className="font-medium">Borrador provisorio.</strong> Este texto todavía no fue revisado por un profesional del derecho. Los datos
          entre [corchetes] se completan antes de publicar.
        </Aviso>

        <nav aria-label="En esta página" className="rounded-tarjeta border border-mar-bordeAgua bg-mar-nube p-5">
          <p className="mb-2 text-etiqueta uppercase text-mar-tintaSuave">En esta página</p>
          <ol className="flex list-decimal flex-col pl-5 text-cuerpo">
            {secciones.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="inline-flex min-h-control-sm items-center">
                  {s.titulo}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {secciones.map((s, i) => (
          <section key={s.id} id={s.id} className="flex flex-col gap-3">
            <h2 className="text-titulo-s font-normal">
              {i + 1}. {s.titulo}
            </h2>
            {s.parrafos.map((p, j) => (
              <p key={j} className="max-w-parrafo text-cuerpo text-mar-tintaSuave">
                {p}
              </p>
            ))}
          </section>
        ))}
      </Burbuja>
    </Pagina>
  )
}
