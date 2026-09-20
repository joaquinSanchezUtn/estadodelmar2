import { useState, type FormEvent } from 'react'
import { guardarTemaAdmin } from '../../datos/contenido'
import type { EstadoMar, EstadoMarId, TemaAdmin } from '../../datos/tipos'
import { aSlug } from '../../lib/slug'
import { useAccion } from '../../lib/useAccion'
import AreaTexto from '../base/AreaTexto'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import Campo from '../base/Campo'
import Interruptor from '../base/Interruptor'
import Selector from '../base/Selector'

type Props = { inicial?: TemaAdmin; estados: EstadoMar[]; onGuardado: (slug: string, eraNueva: boolean) => void }

const MAXIMO = 240

// Datos de una ventana. En una nueva, la dirección se sugiere sola a partir del título hasta que se la toca.
export default function FormularioVentana({ inicial, estados, onGuardado }: Props) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '')
  const [slug, setSlug] = useState(inicial?.slug ?? '')
  const [slugTocado, setSlugTocado] = useState(Boolean(inicial))
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '')
  const [estadoMar, setEstadoMar] = useState<EstadoMarId | ''>(inicial?.estadoMar ?? '')
  const [publicado, setPublicado] = useState(inicial?.publicado ?? false)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const { pendiente, error, ejecutar } = useAccion()

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    setErrores({})
    const ok = await ejecutar(async () => {
      const r = await guardarTemaAdmin(inicial?.slug ?? null, { titulo, slug, descripcion, estadoMar: estadoMar || null, publicado })
      if (r.ok) {
        onGuardado(r.slug ?? slug, !inicial)
        return null
      }
      setErrores(r.errores ?? {})
      return r.mensaje
    })
    if (!ok) document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }

  return (
    <form onSubmit={guardar} noValidate className="flex flex-col gap-5 rounded-tarjeta border border-mar-bordeAgua bg-mar-blanco p-5 md:p-6">
      <h2 className="text-titulo-s font-normal">Datos de la ventana</h2>
      <Campo
        etiqueta="Título"
        value={titulo}
        onChange={(e) => {
          setTitulo(e.target.value)
          if (!slugTocado) setSlug(aSlug(e.target.value))
        }}
        error={errores.titulo}
        autoComplete="off"
      />
      <Campo
        etiqueta="Dirección"
        value={slug}
        onChange={(e) => {
          setSlug(e.target.value)
          setSlugTocado(true)
        }}
        ayuda={`Se ve así: /tema/${slug || 'la-direccion'}${inicial ? '. Si la cambiás, el enlace anterior deja de funcionar.' : ''}`}
        error={errores.slug}
        autoComplete="off"
      />
      <Selector
        etiqueta="Estado del mar"
        value={estadoMar}
        onChange={(e) => setEstadoMar(e.target.value as EstadoMarId | '')}
        opciones={[{ valor: '', texto: 'Sin estado' }, ...estados.map((s) => ({ valor: s.id, texto: s.nombre }))]}
      />
      <div className="flex flex-col gap-2">
        <AreaTexto
          etiqueta="Descripción pública"
          rows={3}
          maxLength={MAXIMO}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          ayuda={`Se ve en el catálogo, incluso sin suscripción. ${descripcion.length} de ${MAXIMO}.`}
          aria-invalid={errores.descripcion ? true : undefined}
        />
        {errores.descripcion && <p className="text-meta text-mar-coral">{errores.descripcion}</p>}
      </div>
      <Interruptor etiqueta="Publicada" ayuda={publicado ? 'Aparece en el catálogo del sitio.' : 'Borrador: solo la ves vos.'} activo={publicado} onCambio={setPublicado} />
      {error && <Aviso>{error}</Aviso>}
      <div>
        <Boton type="submit" disabled={pendiente} aria-busy={pendiente}>
          {pendiente ? 'Guardando…' : inicial ? 'Guardar los cambios' : 'Crear la ventana'}
        </Boton>
      </div>
    </form>
  )
}
