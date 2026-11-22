import { useEffect, useRef, useState, type FormEvent } from 'react'
import { descartarArchivoSubido, guardarContenidoAdmin } from '../../datos/contenido'
import type { ArchivoSubido, ContenidoAdmin, TemaAdmin, TipoContenido } from '../../datos/tipos'
import { useAccion } from '../../lib/useAccion'
import AreaTexto from '../base/AreaTexto'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import Campo from '../base/Campo'
import Interruptor from '../base/Interruptor'
import { nombresDePieza } from './seccionesDelPanel'
import SubidaDeArchivo from './SubidaDeArchivo'

const MAXIMO = 5000

type Props = { tema: TemaAdmin; tipo: TipoContenido; inicial?: ContenidoAdmin; onGuardado: (id: string, eraNueva: boolean) => void }

// Una pieza: primero el archivo (o la consigna, si es una ejercitación), después el título y la duración, y si se
// ve. Una pieza nueva nace visible: lo que decide si las suscriptoras la ven es, sobre todo, si su tema se ve.
export default function FormularioContenido({ tema, tipo, inicial, onGuardado }: Props) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '')
  const [duracion, setDuracion] = useState(inicial?.duracionMin?.toString() ?? '')
  const [cuerpo, setCuerpo] = useState(inicial?.cuerpo ?? '')
  const [publicado, setPublicado] = useState(inicial?.publicado ?? true)
  const [archivo, setArchivo] = useState<ArchivoSubido | 'quitar' | undefined>(undefined)
  const [subiendo, setSubiendo] = useState(false)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const { pendiente, error, ejecutar } = useAccion()
  const mostrado = archivo === 'quitar' ? null : (archivo ?? inicial?.archivo ?? null)

  // Si se sube un archivo y el formulario se abandona sin guardar (se quita antes de mandarlo, se
  // navega a otro lado), ese video queda huérfano en Bunny si nadie lo borra: `archivoRef` sigue el
  // último archivo recién subido y `guardadoRef` marca si sí llegó a guardarse, para no borrar por
  // error el que se acaba de asociar de verdad.
  const archivoRef = useRef(archivo)
  archivoRef.current = archivo
  const guardadoRef = useRef(false)
  // Si la pieza se creó pero el archivo no se pudo asociar (Bunny todavía procesando), el reintento va
  // sobre esa misma pieza.
  const creadaRef = useRef<string | null>(null)
  useEffect(
    () => () => {
      const a = archivoRef.current
      if (!guardadoRef.current && a && a !== 'quitar') void descartarArchivoSubido(a.token)
    },
    [],
  )

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    setErrores({})
    const ok = await ejecutar(async () => {
      const r = await guardarContenidoAdmin(tema.slug, inicial?.id ?? creadaRef.current, { tipo, titulo, duracionMin: duracion.trim() ? Number(duracion) : null, cuerpo: tipo === 'ejercitacion' ? cuerpo : null, publicado }, archivo)
      if (r.ok) {
        guardadoRef.current = true
        onGuardado(r.id ?? '', !inicial)
        return null
      }
      if (r.id) creadaRef.current = r.id
      setErrores(r.errores ?? {})
      return r.mensaje
    })
    if (!ok) document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }

  const quitarArchivo = () => {
    if (archivo && archivo !== 'quitar') void descartarArchivoSubido(archivo.token)
    setArchivo('quitar')
  }

  // Reemplazar sin haber guardado (subir otro archivo antes de mandar el formulario) también deja
  // huérfano el que se acaba de subir, si no se descarta acá.
  const archivoSubido = (nuevo: ArchivoSubido) => {
    if (archivo && archivo !== 'quitar') void descartarArchivoSubido(archivo.token)
    setArchivo(nuevo)
  }

  return (
    <form onSubmit={guardar} noValidate className="flex flex-col gap-6 rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-5 shadow-suave md:p-8">
      <h2 className="text-titulo-m">
        <span aria-hidden="true">{nombresDePieza[tipo].icono} </span>
        {nombresDePieza[tipo].nombre}
      </h2>
      {errores.tipo && <Aviso>{errores.tipo}</Aviso>}
      {tipo === 'ejercitacion' ? (
        <div className="flex flex-col gap-2">
          <AreaTexto etiqueta="1. Escribí la consigna" rows={8} maxLength={MAXIMO} value={cuerpo} onChange={(e) => setCuerpo(e.target.value)} ayuda={`Lo que la persona va a hacer. (${cuerpo.length} de ${MAXIMO} letras)`} aria-invalid={errores.cuerpo ? true : undefined} />
          {errores.cuerpo && <p className="text-meta text-mar-coral">{errores.cuerpo}</p>}
        </div>
      ) : (
        <SubidaDeArchivo tipo={tipo} archivo={mostrado} onSubido={archivoSubido} onQuitar={quitarArchivo} onSubiendo={setSubiendo} />
      )}
      <Campo etiqueta="2. Ponele un título" value={titulo} onChange={(e) => setTitulo(e.target.value)} ayuda="Lo ven las suscriptoras arriba del video." error={errores.titulo} autoComplete="off" />
      <Campo
        etiqueta="3. ¿Cuántos minutos dura? (si no sabés, dejalo vacío)"
        type="number"
        inputMode="numeric"
        min={1}
        max={600}
        value={duracion}
        onChange={(e) => setDuracion(e.target.value)}
        error={errores.duracionMin}
      />
      <Interruptor etiqueta="Mostrar en el sitio" ayuda={publicado ? 'Sí: se ve en el tema (si el tema también se ve).' : 'No: queda oculto, solo lo ves vos.'} activo={publicado} onCambio={setPublicado} />
      {error && <Aviso>{error}</Aviso>}
      <div>
        <Boton type="submit" disabled={pendiente || subiendo} aria-busy={pendiente}>
          {pendiente ? 'Guardando…' : inicial ? 'Guardar los cambios' : '4. Guardar'}
        </Boton>
        {subiendo && <p className="mt-2 text-cuerpo text-mar-tintaSuave">Esperá a que el archivo termine de subir para guardar.</p>}
      </div>
    </form>
  )
}
