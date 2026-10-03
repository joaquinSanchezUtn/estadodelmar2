import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { EstadoMar, QuienSoy, TemaAdmin } from '../../datos/tipos'
import { cn } from '../../lib/cn'
import Boton from '../base/Boton'
import { coloresDe } from '../objetos/estados/colores'
import EstadoDePiezas from './EstadoDePiezas'
import FilaPaso from './FilaPaso'
import { proximosPasos } from './pasos'

type Props = { temas: TemaAdmin[]; estados: EstadoMar[]; sinLeer: number; quienSoy: QuienSoy | null; onCambio: (aviso: string) => void }

function Cifra({ valor, texto, to }: { valor: string; texto: string; to: string }) {
  return (
    <Link to={to} className="rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-5 text-mar-tinta no-underline shadow-suave transition-shadow hover:shadow-alzada">
      <p className="font-titulo text-titulo-l">{valor}</p>
      <p className="text-cuerpo text-mar-tintaSuave">{texto}</p>
    </Link>
  )
}

const PRIMEROS = 6

// La entrada al panel: cómo está el sitio, qué conviene hacer ahora y cómo va cada tema.
export default function ResumenAdmin({ temas, estados, sinLeer, quienSoy, onCambio }: Props) {
  const estilo = (id: string | null) => estados.find((e) => e.id === id)?.estilo ?? null
  const [todos, setTodos] = useState(false)
  const pasos = proximosPasos(temas, sinLeer, quienSoy)
  const piezas = temas.flatMap((t) => t.contenidos)
  const visibles = todos ? pasos : pasos.slice(0, PRIMEROS)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Cifra valor={`${temas.filter((t) => t.publicado).length} de ${temas.length}`} texto="temas publicados" to="/admin/ventanas" />
        <Cifra valor={`${piezas.filter((c) => c.publicado).length} de ${piezas.length}`} texto="piezas publicadas" to="/admin/ventanas" />
        <Cifra valor={String(sinLeer)} texto={sinLeer === 1 ? 'mensaje sin leer' : 'mensajes sin leer'} to="/admin/mensajes" />
        <Cifra valor={quienSoy?.publicado ? 'Visible' : 'Oculta'} texto="página «Quién soy»" to="/admin/quien-soy" />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-6 shadow-suave md:p-8">
          <h2 className="mb-1 text-titulo-m">Próximos pasos</h2>
          <p className="mb-5 text-cuerpo text-mar-tintaSuave">
            {pasos.length === 0 ? 'No falta nada: el sitio está completo.' : 'Lo que falta, empezando por lo que ya está casi listo.'}
          </p>
          {pasos.length > 0 && (
            <ol className="flex flex-col divide-y divide-mar-bordeAgua">
              {visibles.map((p) => (
                <FilaPaso key={p.texto} paso={p} onCambio={onCambio} />
              ))}
            </ol>
          )}
          {pasos.length > PRIMEROS && (
            <Boton compacto variante="fantasma" className="mt-3" onClick={() => setTodos(!todos)} aria-expanded={todos}>
              {todos ? 'Ver menos' : `Ver los ${pasos.length} pasos`}
            </Boton>
          )}
        </section>

        <section className="rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-6 shadow-suave md:p-8">
          <h2 className="mb-1 text-titulo-m">Cómo va cada tema</h2>
          <p className="mb-5 text-cuerpo text-mar-tintaSuave">Cada tema lleva un video, una meditación y una ejercitación.</p>
          {temas.length === 0 ? (
            <p className="text-cuerpo text-mar-tintaSuave">Todavía no hay temas.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-mar-bordeAgua">
              {temas.map((t) => (
                <li key={t.slug} className="flex flex-col gap-2 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span aria-hidden="true" className={cn('size-3 rounded-full border', coloresDe(estilo(t.estadoMar)).agua, coloresDe(estilo(t.estadoMar)).aroClaro)} />
                    <Link to={`/admin/ventanas/${t.slug}`} className="inline-flex min-h-control-sm items-center font-titulo text-titulo-s text-mar-tinta no-underline hover:underline">
                      {t.titulo}
                    </Link>
                    <span className="text-meta text-mar-tintaSuave">
                      {[estados.find((e) => e.id === t.estadoMar)?.nombre, t.publicado ? 'publicado' : 'borrador'].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                  <EstadoDePiezas tema={t} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
