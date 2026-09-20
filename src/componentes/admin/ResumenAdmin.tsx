import { Link } from 'react-router-dom'
import type { TemaAdmin } from '../../datos/tipos'
import Tarjeta from '../base/Tarjeta'

const nombresDeTipo = { video: 'Video', meditacion: 'Meditación', ejercitacion: 'Ejercitación' }

function Cifra({ valor, texto }: { valor: number; texto: string }) {
  return (
    <div className="rounded-tarjeta border border-mar-bordeAgua bg-mar-blanco p-5">
      <p className="font-titulo text-titulo-l font-light">{valor}</p>
      <p className="text-cuerpo text-mar-tintaSuave">{texto}</p>
    </div>
  )
}

// Cuántas ventanas hay, qué falta publicar y qué piezas todavía no tienen su archivo.
export default function ResumenAdmin({ temas }: { temas: TemaAdmin[] }) {
  const borradores = temas.filter((t) => !t.publicado)
  const piezas = temas.flatMap((t) => t.contenidos.map((c) => ({ tema: t, contenido: c })))
  const sinArchivo = piezas.filter(({ contenido: c }) => c.tipo !== 'ejercitacion' && !c.archivo)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Cifra valor={temas.length - borradores.length} texto="ventanas publicadas" />
        <Cifra valor={borradores.length} texto="borradores" />
        <Cifra valor={piezas.length} texto="piezas en total" />
        <Cifra valor={sinArchivo.length} texto="sin archivo subido" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Tarjeta className="p-6">
          <h2 className="mb-3 text-titulo-s font-normal">Para publicar</h2>
          {borradores.length === 0 ? (
            <p className="text-cuerpo text-mar-tintaSuave">No hay borradores: todo está publicado.</p>
          ) : (
            <ul className="flex flex-col">
              {borradores.map((t) => (
                <li key={t.slug}>
                  <Link to={`/admin/ventanas/${t.slug}`} className="inline-flex min-h-control-sm items-center hover:underline">
                    {t.titulo}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>

        <Tarjeta className="p-6">
          <h2 className="mb-3 text-titulo-s font-normal">Piezas sin archivo</h2>
          {sinArchivo.length === 0 ? (
            <p className="text-cuerpo text-mar-tintaSuave">Todas las piezas de video y audio tienen su archivo.</p>
          ) : (
            <ul className="flex flex-col">
              {sinArchivo.map(({ tema, contenido }) => (
                <li key={contenido.id}>
                  <Link to={`/admin/ventanas/${tema.slug}/contenidos/${contenido.id}`} className="inline-flex min-h-control-sm items-center hover:underline">
                    {tema.titulo} · {nombresDeTipo[contenido.tipo]}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
    </div>
  )
}
