import clsx from 'clsx'
import { useState } from 'react'
import type { EstadoMar, TemaAdmin } from '../../datos/tipos'
import Campo from '../base/Campo'
import Sello from '../base/Sello'

// Busca sin distinguir mayúsculas ni tildes: "desilusion" encuentra "Desilusión".
const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

type Props = {
  temas: TemaAdmin[]
  estados: EstadoMar[]
  seleccionado: string
  onElegir: (slug: string) => void
}

export default function ListadoVentanas({ temas, estados, seleccionado, onElegir }: Props) {
  const [busqueda, setBusqueda] = useState('')
  const visibles = temas.filter((t) => normalizar(t.titulo).includes(normalizar(busqueda)))
  const estadoDe = (t: TemaAdmin) => estados.find((e) => e.id === t.estadoMar)?.nombre ?? 'Sin estado'

  return (
    <div className="flex flex-col gap-4">
      <Campo
        etiqueta="Buscar ventana"
        type="search"
        autoComplete="off"
        placeholder="Ansiedad, pareja…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <p role="status" className="text-sm text-mar-tintaSuave">
        {visibles.length} de {temas.length} ventanas
      </p>

      {visibles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-mar-bordeAgua bg-mar-blanco/60 p-4 text-base text-mar-tintaSuave">
          Ninguna ventana coincide con la búsqueda.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visibles.map((t) => {
            const activa = t.slug === seleccionado
            const n = t.contenidos.length
            return (
              <li key={t.slug}>
                <button
                  type="button"
                  aria-pressed={activa}
                  onClick={() => onElegir(t.slug)}
                  className={clsx(
                    'flex min-h-[64px] w-full flex-col gap-1 rounded-xl border p-3.5 text-left transition',
                    activa
                      ? 'border-mar-agua bg-mar-espuma'
                      : 'border-mar-bordeAgua bg-mar-blanco hover:border-mar-aguaSuave',
                  )}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-titulo text-lg text-mar-tinta">{t.titulo}</span>
                    <Sello tono={t.publicado ? 'agua' : 'coral'}>
                      {t.publicado ? 'Publicada' : 'Borrador'}
                    </Sello>
                  </span>
                  <span className="text-sm text-mar-tintaSuave">
                    {estadoDe(t)} · {n} {n === 1 ? 'contenido' : 'contenidos'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
