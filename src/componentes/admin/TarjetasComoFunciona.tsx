import { MAXIMO_PASOS } from '../../datos/portada'
import type { Paso } from '../../datos/tipos'
import AreaTexto from '../base/AreaTexto'
import Boton from '../base/Boton'
import Campo from '../base/Campo'
import { Abajo, Arriba, Cerrar } from '../base/iconos'

// Un id solo para React (identifica la tarjeta mientras se edita, nunca viaja al servidor): sin esto, la key
// por posición hace que al reordenar o sacar una tarjeta el foco salte a otra.
export type PasoEnEdicion = Paso & { id: string }
export const idNuevo = () => `nuevo-${Math.random().toString(36).slice(2, 10)}`

type Props = { pasos: PasoEnEdicion[]; onCambio: (pasos: PasoEnEdicion[]) => void; error?: string }

const boton = 'flex size-11 shrink-0 items-center justify-center rounded-full border border-mar-bordeControl bg-mar-blanco text-mar-tinta hover:bg-mar-aguaClara disabled:opacity-40'

// Las tarjetas numeradas de «Cómo funciona»: editar, agregar, sacar y reordenar. El número sale del orden.
export default function TarjetasComoFunciona({ pasos, onCambio, error }: Props) {
  const cambiar = (id: string, parte: Partial<Paso>) => onCambio(pasos.map((p) => (p.id === id ? { ...p, ...parte } : p)))
  const sacar = (id: string) => onCambio(pasos.filter((p) => p.id !== id))
  const mover = (i: number, direccion: -1 | 1) => {
    const j = i + direccion
    if (j < 0 || j >= pasos.length) return
    const copia = [...pasos]
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
    onCambio(copia)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-cuerpo font-medium text-mar-tinta">Tarjetas</h3>
        <Boton type="button" compacto variante="secundario" onClick={() => onCambio([...pasos, { titulo: '', texto: '', id: idNuevo() }])} disabled={pasos.length >= MAXIMO_PASOS}>
          Agregar tarjeta
        </Boton>
      </div>
      <p className="text-meta text-mar-tintaSuave">Se muestran en este orden, numeradas solas. Hasta {MAXIMO_PASOS}. Sin ninguna, la sección no aparece en la home.</p>

      {pasos.length === 0 ? (
        <p className="text-cuerpo text-mar-tintaSuave">No hay tarjetas: «Cómo funciona» no se ve en la home.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {pasos.map((p, i) => (
            <li key={p.id} className="flex flex-col gap-3 rounded-control border border-mar-bordeAgua p-3 md:flex-row md:items-start">
              <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-tarjeta bg-mar-primarioSuave text-destacado font-bold text-mar-primario">
                {i + 1}
              </span>
              <div className="flex flex-1 flex-col gap-2">
                <Campo etiqueta={`Título de la tarjeta ${i + 1}`} value={p.titulo} onChange={(e) => cambiar(p.id, { titulo: e.target.value })} maxLength={60} autoComplete="off" />
                <AreaTexto etiqueta={`Texto de la tarjeta ${i + 1}`} rows={2} value={p.texto} onChange={(e) => cambiar(p.id, { texto: e.target.value })} maxLength={200} />
              </div>
              <div className="flex items-center gap-2 md:pt-8">
                <button type="button" className={boton} disabled={i === 0} aria-label={`Subir la tarjeta ${i + 1}`} onClick={() => mover(i, -1)}>
                  <Arriba />
                </button>
                <button type="button" className={boton} disabled={i === pasos.length - 1} aria-label={`Bajar la tarjeta ${i + 1}`} onClick={() => mover(i, 1)}>
                  <Abajo />
                </button>
                <button type="button" className={boton} aria-label={`Quitar la tarjeta ${i + 1}`} onClick={() => sacar(p.id)}>
                  <Cerrar className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
      {error && <p className="text-meta text-mar-coral">{error}</p>}
    </div>
  )
}
