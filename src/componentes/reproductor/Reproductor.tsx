import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { obtenerOrigenDeMedio, type OrigenDeMedio } from '../../datos/contenido'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import BotonReproducir from '../base/BotonReproducir'
import Olas from '../objetos/Olas'
import Controles from './Controles'
import { useMedio } from './useMedio'

type Props = {
  tipo: 'video' | 'audio'
  contenidoId: string
  titulo: string
  // El título y los datos de una pieza de audio: van al lado del botón de reproducir.
  cabecera?: ReactNode
}
type Fase = 'reposo' | 'pidiendo' | 'sin-archivo' | 'error' | 'listo'

// Reproductor propio de video y audio. La URL no se pide hasta que la persona le da reproducir (así
// dura lo que tiene que durar) y se renueva sola si vence o falla a mitad de camino, retomando desde
// el mismo segundo. Estados: reposo, pidiendo la URL, sin archivo, error y listo.
export default function Reproductor({ tipo, contenidoId, titulo, cabecera }: Props) {
  const medio = useRef<HTMLMediaElement>(null)
  const [fase, setFase] = useState<Fase>('reposo')
  const [origen, setOrigen] = useState<OrigenDeMedio | null>(null)
  const retomar = useRef<{ en: number; sonar: boolean } | null>({ en: 0, sonar: true })
  const control = useMedio(medio, origen?.url ?? null)
  const renovada = useRef(false) // ante un fallo se pide una URL nueva una sola vez: sin bucles

  const pedir = async (en: number, sonar: boolean) => {
    retomar.current = { en, sonar }
    setFase('pidiendo')
    try {
      const o = await obtenerOrigenDeMedio(contenidoId)
      if (!o) return setFase('sin-archivo')
      setOrigen(o)
      setFase('listo')
    } catch {
      setFase('error')
    }
  }

  // Al desmontarse (se perdió el acceso, se cerró la sesión o se cambió de pantalla) el medio se suelta de
  // verdad: sin esto el audio podía seguir sonando con la URL firmada ya fuera de la pantalla.
  useEffect(() => {
    const m = medio.current
    const url = origen?.url
    return () => {
      if (m) {
        m.pause()
        m.removeAttribute('src')
        m.load()
      }
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
    }
  }, [origen])

  // Cuando el elemento nuevo tiene sus datos, se retoma desde donde se estaba.
  useEffect(() => {
    const m = medio.current
    if (!m || !origen) return
    const listo = () => {
      const r = retomar.current
      if (!r) return
      retomar.current = null
      renovada.current = false
      if (r.en) m.currentTime = r.en
      if (r.sonar) void m.play().catch(() => undefined)
    }
    m.addEventListener('loadedmetadata', listo, { once: true })
    return () => m.removeEventListener('loadedmetadata', listo)
  }, [origen])

  // Un fallo de reproducción casi siempre es una URL vencida (el reloj de esta máquina puede estar atrasado,
  // así que no se le cree): se pide otra, una vez, y si vuelve a fallar se avisa.
  const alFallar = () => {
    const m = medio.current
    if (renovada.current) return setFase('error')
    renovada.current = true
    void pedir(m?.currentTime ?? 0, !m?.paused)
  }

  const alAlternar = () => {
    if (origen && Date.now() >= origen.venceEn) return void pedir(control.estado.actual, true)
    control.alternar()
  }

  const esVideo = tipo === 'video'

  // Lo que se dice según la fase: sirve igual sobre el video o suelto arriba del audio.
  const mensaje =
    fase === 'pidiendo' ? (
      <p role="status" className="p-6 text-cuerpo text-mar-tintaSuave">
        Preparando la reproducción…
      </p>
    ) : fase === 'sin-archivo' ? (
      <Aviso tono="info" className="m-4">
        Todavía no hay un archivo para esta pieza. Cuando se suba, se va a poder reproducir desde acá.
      </Aviso>
    ) : fase === 'error' ? (
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        <Aviso>No pudimos reproducir esto ahora.</Aviso>
        <Boton compacto variante="secundario" onClick={() => pedir(control.estado.actual, false)}>
          Reintentar
        </Boton>
      </div>
    ) : null

  return (
    <div>
      {esVideo ? (
        <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-gradient-to-b from-mar-espuma to-mar-aguaClara">
          {fase !== 'listo' && <Olas className="h-16 md:h-20" />}
          {fase === 'listo' && (
            <video ref={medio as RefObject<HTMLVideoElement>} src={origen?.url} playsInline preload="metadata" onError={alFallar} onClick={alAlternar} className="size-full bg-mar-tinta object-contain" />
          )}
          {fase === 'reposo' && (
            <div className="relative rounded-full shadow-tarjeta">
              <BotonReproducir tamano="grande" etiqueta={`Reproducir ${titulo}`} onClick={() => pedir(0, true)} />
            </div>
          )}
          {mensaje}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 p-5 pb-2">
            {fase === 'reposo' && <BotonReproducir tamano="chico" etiqueta={`Reproducir ${titulo}`} onClick={() => pedir(0, true)} />}
            {cabecera}
          </div>
          {fase === 'listo' && <audio ref={medio as RefObject<HTMLAudioElement>} src={origen?.url} preload="metadata" onError={alFallar} />}
          {mensaje}
        </>
      )}

      {fase === 'listo' && (
        <Controles
          estado={control.estado}
          titulo={titulo}
          conPantallaCompleta={esVideo}
          onAlternar={alAlternar}
          onBuscar={control.buscar}
          onSilenciar={control.silenciar}
          onVelocidad={control.siguienteVelocidad}
          onPantallaCompleta={control.pantallaCompleta}
        />
      )}
    </div>
  )
}
