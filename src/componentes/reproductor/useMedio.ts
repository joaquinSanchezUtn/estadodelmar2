import { useCallback, useEffect, useState, type RefObject } from 'react'

export const VELOCIDADES = [1, 1.25, 1.5, 0.75]

export type EstadoDeMedio = {
  sonando: boolean
  actual: number
  duracion: number
  esperando: boolean // buffering: se pidió reproducir y todavía no hay datos
  silenciado: boolean
  velocidad: number
}

// Lleva el estado de un <video> o <audio> a React y expone los controles. `clave` es la URL: cuando
// cambia (por ejemplo, una URL firmada nueva) se vuelven a enganchar los eventos del elemento nuevo.
export function useMedio(ref: RefObject<HTMLMediaElement | null>, clave: string | null) {
  const [estado, setEstado] = useState<EstadoDeMedio>({ sonando: false, actual: 0, duracion: 0, esperando: false, silenciado: false, velocidad: 1 })
  const cambiar = useCallback((parte: Partial<EstadoDeMedio>) => setEstado((e) => ({ ...e, ...parte })), [])

  useEffect(() => {
    const m = ref.current
    if (!m) return
    const alTiempo = () => cambiar({ actual: m.currentTime })
    const alMetadatos = () => cambiar({ duracion: m.duration, esperando: false })
    const eventos: [string, () => void][] = [
      ['timeupdate', alTiempo],
      ['loadedmetadata', alMetadatos],
      ['durationchange', alMetadatos],
      ['play', () => cambiar({ sonando: true })],
      ['pause', () => cambiar({ sonando: false })],
      ['ended', () => cambiar({ sonando: false, actual: 0 })],
      ['waiting', () => cambiar({ esperando: true })],
      ['playing', () => cambiar({ esperando: false, sonando: true })],
      ['canplay', () => cambiar({ esperando: false })],
      ['volumechange', () => cambiar({ silenciado: m.muted })],
    ]
    eventos.forEach(([n, f]) => m.addEventListener(n, f))
    return () => eventos.forEach(([n, f]) => m.removeEventListener(n, f))
  }, [ref, clave, cambiar])

  const alternar = () => {
    const m = ref.current
    if (m) void (m.paused ? m.play() : m.pause())
  }
  const buscar = (segundos: number) => {
    const m = ref.current
    if (!m) return
    m.currentTime = Math.min(Math.max(0, segundos), Number.isFinite(m.duration) ? m.duration : segundos)
    cambiar({ actual: m.currentTime })
  }
  const silenciar = () => {
    const m = ref.current
    if (m) m.muted = !m.muted
  }
  const siguienteVelocidad = () => {
    const m = ref.current
    if (!m) return
    m.playbackRate = VELOCIDADES[(VELOCIDADES.indexOf(m.playbackRate) + 1) % VELOCIDADES.length]
    cambiar({ velocidad: m.playbackRate })
  }
  const pantallaCompleta = () => void (ref.current?.parentElement ?? ref.current)?.requestFullscreen?.()

  return { estado, alternar, buscar, silenciar, siguienteVelocidad, pantallaCompleta }
}
