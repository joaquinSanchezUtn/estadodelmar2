import clsx from 'clsx'
import { useState } from 'react'

// Zona para arrastrar archivos, con un botón alternativo para elegirlos.
// Todavía no sube nada: solo lista lo elegido. La subida va con Bunny.
export default function ZonaArchivos() {
  const [archivos, setArchivos] = useState<File[]>([])
  const [encima, setEncima] = useState(false)

  const agregar = (lista: FileList | null) =>
    setArchivos((previos) => [...previos, ...Array.from(lista ?? [])])

  return (
    <section aria-labelledby="titulo-archivos">
      <h3 id="titulo-archivos" className="mb-2 text-lg font-normal">
        Archivos
      </h3>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setEncima(true)
        }}
        onDragLeave={() => setEncima(false)}
        onDrop={(e) => {
          e.preventDefault()
          setEncima(false)
          agregar(e.dataTransfer.files)
        }}
        className={clsx(
          'flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition',
          encima ? 'border-mar-agua bg-mar-espuma' : 'border-mar-bordeAgua bg-mar-blanco/60',
        )}
      >
        <p className="text-base text-mar-tinta">Arrastrá acá tus videos o audios</p>
        <p className="text-sm text-mar-tintaSuave">o</p>
        <label className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-full border border-mar-aguaSuave/70 bg-mar-blanco px-6 text-[15px] text-mar-tinta hover:bg-mar-aguaClara has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mar-agua">
          <input
            type="file"
            multiple
            accept="video/*,audio/*"
            className="sr-only"
            onChange={(e) => {
              agregar(e.target.files)
              e.target.value = '' // permite volver a elegir el mismo archivo
            }}
          />
          Elegir archivos
        </label>
      </div>

      {archivos.length > 0 && (
        <ul aria-label="Archivos elegidos" className="mt-3 flex flex-col gap-1.5 text-[15px]">
          {archivos.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex justify-between gap-3 text-mar-tinta">
              <span className="break-all">{f.name}</span>
              <span className="shrink-0 text-mar-tintaSuave">
                {(f.size / 1_000_000).toLocaleString('es-AR', { maximumFractionDigits: 1 })} MB
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
