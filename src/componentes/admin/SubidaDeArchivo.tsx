import { useRef, useState } from 'react'
import { LIMITE_DE_ARCHIVO_MB, subirArchivoAdmin } from '../../datos/contenido'
import type { ArchivoDeContenido, ArchivoSubido } from '../../datos/tipos'
import { tamano } from '../../lib/formato'
import { cn } from '../../lib/cn'
import Aviso from '../base/Aviso'
import Boton, { clasesBoton } from '../base/Boton'

type Props = {
  tipo: 'video' | 'meditacion'
  archivo: ArchivoDeContenido | null
  onSubido: (archivo: ArchivoSubido) => void
  onQuitar: () => void
  // Avisa cuándo empieza y termina una subida, para que el formulario no deje guardar a mitad de camino.
  onSubiendo?: (subiendo: boolean) => void
}

// Subida de un archivo de video o audio: se elige o se arrastra, muestra el avance, se puede cancelar y
// reemplazar. Sube directo desde el navegador a Bunny Stream, por una URL que firma una Edge Function.
export default function SubidaDeArchivo({ tipo, archivo, onSubido, onQuitar, onSubiendo }: Props) {
  const [subiendo, setSubiendo] = useState<{ nombre: string; porcentaje: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [encima, setEncima] = useState(false)
  const control = useRef<AbortController | null>(null)
  const limite = LIMITE_DE_ARCHIVO_MB[tipo]
  const clase = tipo === 'video' ? 'video/*' : 'audio/*'

  const subir = async (lista: FileList | null) => {
    const f = lista?.[0]
    if (!f || subiendo) return
    setError(null)
    setSubiendo({ nombre: f.name, porcentaje: 0 })
    onSubiendo?.(true)
    control.current = new AbortController()
    const r = await subirArchivoAdmin(tipo, f, (porcentaje) => setSubiendo({ nombre: f.name, porcentaje }), control.current.signal)
    setSubiendo(null)
    onSubiendo?.(false)
    if (r.ok) onSubido(r.archivo)
    else setError(r.mensaje)
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-destacado font-bold text-mar-tinta">{tipo === 'video' ? '1. Elegí el video' : '1. Elegí el audio'}</p>

      {subiendo ? (
        <div className="flex flex-col gap-3 rounded-tarjeta border border-mar-bordeAgua bg-mar-blanco p-5">
          <p className="break-all text-destacado text-mar-tinta">Subiendo {subiendo.nombre}… No cierres esta página hasta que llegue al 100 %.</p>
          <div role="progressbar" aria-label="Avance de la subida" aria-valuemin={0} aria-valuemax={100} aria-valuenow={subiendo.porcentaje} className="h-3 overflow-hidden rounded-full bg-mar-aguaClara">
            <div className="h-full rounded-full bg-mar-agua transition-[width]" style={{ width: `${subiendo.porcentaje}%` }} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-destacado font-bold tabular-nums text-mar-tinta">{subiendo.porcentaje} %</span>
            <Boton compacto variante="fantasma" onClick={() => control.current?.abort()}>
              Cancelar la subida
            </Boton>
          </div>
        </div>
      ) : archivo ? (
        <div className="flex flex-col gap-3 rounded-tarjeta border border-mar-bordeAgua bg-mar-blanco p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-meta font-bold text-mar-primario">✓ Archivo listo</p>
            <p className="break-all text-cuerpo text-mar-tinta">{archivo.nombre}</p>
            <p className="text-meta text-mar-tintaSuave">{tamano(archivo.bytes)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className={cn(clasesBoton('secundario', true), 'cursor-pointer has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mar-agua')}>
              Reemplazar
              <input type="file" accept={clase} className="sr-only" onChange={(e) => { void subir(e.target.files); e.target.value = '' }} />
            </label>
            <Boton compacto variante="fantasma" onClick={onQuitar}>
              Quitar
            </Boton>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setEncima(true) }}
          onDragLeave={() => setEncima(false)}
          onDrop={(e) => { e.preventDefault(); setEncima(false); void subir(e.dataTransfer.files) }}
          className={cn('flex flex-col items-center gap-3 rounded-tarjeta border-2 border-dashed p-6 text-center transition', encima ? 'border-mar-agua bg-mar-espuma' : 'border-mar-bordeControl bg-mar-blanco/60')}
        >
          <label className={cn(clasesBoton('primario'), 'cursor-pointer has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mar-agua')}>
            {tipo === 'video' ? 'Elegir el video de la computadora' : 'Elegir el audio de la computadora'}
            <input type="file" accept={clase} className="sr-only" onChange={(e) => { void subir(e.target.files); e.target.value = '' }} />
          </label>
          <p className="text-meta text-mar-tintaSuave">o arrastralo hasta acá</p>
        </div>
      )}
      <p className="text-meta text-mar-tintaSuave">Hasta {limite >= 1024 ? `${limite / 1024} GB` : `${limite} MB`}. Un video largo puede tardar varios minutos en subir.</p>
      {error && <Aviso>{error}</Aviso>}
    </div>
  )
}
