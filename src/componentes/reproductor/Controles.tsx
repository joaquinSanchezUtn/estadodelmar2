import { reloj } from '../../lib/formato'
import BotonReproducir from '../base/BotonReproducir'
import { Expandir, Silenciado, Volumen } from '../base/iconos'
import type { EstadoDeMedio } from './useMedio'

type Props = {
  estado: EstadoDeMedio
  titulo: string
  conPantallaCompleta: boolean
  onAlternar: () => void
  onBuscar: (segundos: number) => void
  onSilenciar: () => void
  onVelocidad: () => void
  onPantallaCompleta: () => void
}

const chico =
  'flex min-h-control-sm min-w-11 items-center justify-center rounded-full px-3 text-meta text-mar-tinta hover:bg-mar-aguaClara'

// La barra de control: reproducir/pausar, avance, tiempo, ±10 s, velocidad, silencio y pantalla completa.
export default function Controles({ estado, titulo, conPantallaCompleta, onAlternar, onBuscar, onSilenciar, onVelocidad, onPantallaCompleta }: Props) {
  const { sonando, actual, duracion, esperando, silenciado, velocidad } = estado

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-3">
        <span className="w-11 shrink-0 text-right text-meta tabular-nums text-mar-tintaSuave">{reloj(actual)}</span>
        <input
          type="range"
          min={0}
          max={duracion || 0}
          step={1}
          value={actual}
          onChange={(e) => onBuscar(Number(e.target.value))}
          aria-label={`Avance de ${titulo}`}
          aria-valuetext={`${reloj(actual)} de ${reloj(duracion)}`}
          disabled={!duracion}
          className="h-control-sm min-w-0 flex-1 accent-mar-agua disabled:opacity-50"
        />
        <span className="w-11 shrink-0 text-meta tabular-nums text-mar-tintaSuave">{reloj(duracion)}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <BotonReproducir tamano="chico" sonando={sonando} etiqueta={sonando ? `Pausar ${titulo}` : `Reproducir ${titulo}`} onClick={onAlternar} />
          <button type="button" onClick={() => onBuscar(actual - 10)} className={chico} aria-label="Retroceder 10 segundos">
            −10 s
          </button>
          <button type="button" onClick={() => onBuscar(actual + 10)} className={chico} aria-label="Adelantar 10 segundos">
            +10 s
          </button>
          {esperando && (
            <span role="status" className="ml-2 text-meta text-mar-tintaSuave">
              Cargando…
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onVelocidad} className={chico} aria-label={`Velocidad ${velocidad}x. Tocá para cambiarla`}>
            {velocidad}×
          </button>
          <button type="button" onClick={onSilenciar} className={chico} aria-pressed={silenciado} aria-label={silenciado ? 'Activar el sonido' : 'Silenciar'}>
            {silenciado ? <Silenciado /> : <Volumen />}
          </button>
          {conPantallaCompleta && (
            <button type="button" onClick={onPantallaCompleta} className={chico} aria-label="Pantalla completa">
              <Expandir />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
