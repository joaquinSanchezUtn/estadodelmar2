import { useState, type FormEvent } from 'react'
import { estilos } from '../../datos/constantes'
import { guardarEstadoAdmin } from '../../datos/estados'
import type { EstadoMarAdmin, EstiloId } from '../../datos/tipos'
import { cn } from '../../lib/cn'
import AreaTexto from '../base/AreaTexto'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import Campo from '../base/Campo'
import Interruptor from '../base/Interruptor'
import Selector from '../base/Selector'
import DibujoEstado from '../objetos/DibujoEstado'
import { coloresDe } from '../objetos/estados/colores'

type Props = { inicial?: EstadoMarAdmin; onGuardado: (id: string, eraNueva: boolean) => void }

const error = (texto?: string) => texto && <p className="-mt-3 text-meta text-mar-coral">{texto}</p>

// Los datos de una ventana: nombre, qué se vive ahí, su enseñanza, su aspecto y si está activa en el sitio.
// La dirección sale del nombre al crearla y después no cambia (la usan los enlaces y los temas).
export default function FormularioEstado({ inicial, onGuardado }: Props) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [estadoInterno, setEstadoInterno] = useState(inicial?.estadoInterno ?? '')
  const [ensenanza, setEnsenanza] = useState(inicial?.ensenanza ?? '')
  const [estilo, setEstilo] = useState<EstiloId>(inicial?.estilo ?? 'calma')
  const [publicado, setPublicado] = useState(inicial?.publicado ?? true)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [pendiente, setPendiente] = useState(false)

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setPendiente(true)
    const r = await guardarEstadoAdmin(inicial?.id ?? null, { nombre, estadoInterno, ensenanza, estilo, publicado })
    setPendiente(false)
    if (!r.ok) {
      setErrores(r.errores ?? {})
      return setMensaje(r.mensaje)
    }
    setErrores({})
    setMensaje(null)
    onGuardado(r.id ?? inicial?.id ?? '', !inicial)
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-6 rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-6 shadow-suave">
      <Campo
        etiqueta="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        maxLength={60}
        error={errores.nombre}
        ayuda="El título de la tarjeta, por ejemplo «Tormenta»."
      />
      <AreaTexto etiqueta="Qué se vive acá" ayuda="Por ejemplo: Estrés, preocupación, ansiedad, enojo, miedo." rows={2} maxLength={200} value={estadoInterno} onChange={(e) => setEstadoInterno(e.target.value)} />
      {error(errores.estadoInterno)}
      <AreaTexto etiqueta="Enseñanza" ayuda="Una frase corta. Va en la tarjeta y en la página de la ventana." rows={2} maxLength={300} value={ensenanza} onChange={(e) => setEnsenanza(e.target.value)} />
      {error(errores.ensenanza)}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Selector etiqueta="Color y dibujo" value={estilo} onChange={(e) => setEstilo(e.target.value as EstiloId)} opciones={estilos.map((s) => ({ valor: s.id, texto: s.nombre }))} />
        </div>
        <span aria-hidden="true" className={cn('relative block h-16 w-24 shrink-0 overflow-hidden rounded-tarjeta border', coloresDe(estilo).agua, coloresDe(estilo).aroClaro)}>
          <DibujoEstado estado={estilo} vivo="siempre" autonomo />
        </span>
      </div>
      <p className="-mt-3 text-meta text-mar-tintaSuave">El color de la tarjeta, y el dibujo que se ve si la ventana no tiene foto.</p>
      {error(errores.estilo)}
      <Interruptor etiqueta="Mostrar en el sitio" ayuda={publicado ? 'Sí: aparece en «¿Cómo está tu mar hoy?».' : 'No: queda oculta, solo la ves vos. No se pierde nada.'} activo={publicado} onCambio={setPublicado} />
      {mensaje && <Aviso>{mensaje}</Aviso>}
      <div>
        <Boton type="submit" disabled={pendiente} aria-busy={pendiente}>
          {pendiente ? 'Guardando…' : inicial ? 'Guardar los cambios' : 'Crear la ventana'}
        </Boton>
      </div>
    </form>
  )
}
