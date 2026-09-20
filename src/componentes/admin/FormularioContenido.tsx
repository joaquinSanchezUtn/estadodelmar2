import { useState, type FormEvent } from 'react'
import { guardarContenidoAdmin } from '../../datos/contenido'
import type { ArchivoSubido, ContenidoAdmin, TemaAdmin, TipoContenido } from '../../datos/tipos'
import { useAccion } from '../../lib/useAccion'
import AreaTexto from '../base/AreaTexto'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import Campo from '../base/Campo'
import Interruptor from '../base/Interruptor'
import SubidaDeArchivo from './SubidaDeArchivo'

const nombres: Record<TipoContenido, string> = { video: 'Video psicoeducativo', meditacion: 'Meditación guiada', ejercitacion: 'Ejercitación' }
const MAXIMO = 5000

type Props = { tema: TemaAdmin; tipo: TipoContenido; inicial?: ContenidoAdmin; onGuardado: (id: string, eraNueva: boolean) => void }

// Una pieza: título, duración, publicación y, según el tipo, la consigna escrita o el archivo de video/audio.
export default function FormularioContenido({ tema, tipo, inicial, onGuardado }: Props) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '')
  const [duracion, setDuracion] = useState(inicial?.duracionMin?.toString() ?? '')
  const [cuerpo, setCuerpo] = useState(inicial?.cuerpo ?? '')
  const [publicado, setPublicado] = useState(inicial?.publicado ?? false)
  const [archivo, setArchivo] = useState<ArchivoSubido | 'quitar' | undefined>(undefined)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const { pendiente, error, ejecutar } = useAccion()
  const mostrado = archivo === 'quitar' ? null : (archivo ?? inicial?.archivo ?? null)

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    setErrores({})
    const ok = await ejecutar(async () => {
      const r = await guardarContenidoAdmin(tema.slug, inicial?.id ?? null, { tipo, titulo, duracionMin: duracion.trim() ? Number(duracion) : null, cuerpo: tipo === 'ejercitacion' ? cuerpo : null, publicado }, archivo)
      if (r.ok) {
        onGuardado(r.id ?? '', !inicial)
        return null
      }
      setErrores(r.errores ?? {})
      return r.mensaje
    })
    if (!ok) document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }

  return (
    <form onSubmit={guardar} noValidate className="flex flex-col gap-5 rounded-tarjeta border border-mar-bordeAgua bg-mar-blanco p-5 md:p-6">
      <h2 className="text-titulo-s font-normal">{nombres[tipo]}</h2>
      {errores.tipo && <Aviso>{errores.tipo}</Aviso>}
      <Campo etiqueta="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} error={errores.titulo} autoComplete="off" />
      <Campo
        etiqueta="Duración (minutos)"
        type="number"
        inputMode="numeric"
        min={1}
        max={600}
        value={duracion}
        onChange={(e) => setDuracion(e.target.value)}
        ayuda="Se muestra en la ventana, incluso sin suscripción."
        error={errores.duracionMin}
      />
      {tipo === 'ejercitacion' ? (
        <div className="flex flex-col gap-2">
          <AreaTexto etiqueta="Consigna" rows={8} maxLength={MAXIMO} value={cuerpo} onChange={(e) => setCuerpo(e.target.value)} ayuda={`Lo que la persona va a hacer. ${cuerpo.length} de ${MAXIMO}.`} aria-invalid={errores.cuerpo ? true : undefined} />
          {errores.cuerpo && <p className="text-meta text-mar-coral">{errores.cuerpo}</p>}
        </div>
      ) : (
        <SubidaDeArchivo tipo={tipo} archivo={mostrado} onSubido={setArchivo} onQuitar={() => setArchivo('quitar')} />
      )}
      <Interruptor etiqueta="Publicada" ayuda={publicado ? 'Las suscriptoras la ven en la ventana.' : 'Borrador: todavía no se ve.'} activo={publicado} onCambio={setPublicado} />
      {error && <Aviso>{error}</Aviso>}
      <div>
        <Boton type="submit" disabled={pendiente} aria-busy={pendiente}>
          {pendiente ? 'Guardando…' : inicial ? 'Guardar los cambios' : 'Agregar a la ventana'}
        </Boton>
      </div>
    </form>
  )
}
