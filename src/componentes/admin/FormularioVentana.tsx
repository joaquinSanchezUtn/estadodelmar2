import { useState, type FormEvent } from 'react'
import { guardarTemaAdmin, listarEnfoques } from '../../datos/contenido'
import type { EnfoqueId, EstadoMar, EstadoMarId, TemaAdmin } from '../../datos/tipos'
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
const enfoques = listarEnfoques()

// Datos de una ventana. En una nueva, la dirección se sugiere sola a partir del título hasta que se la toca.
export default function FormularioVentana({ inicial, estados, onGuardado }: Props) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '')
  const [slug, setSlug] = useState(inicial?.slug ?? '')
  const [slugTocado, setSlugTocado] = useState(Boolean(inicial))
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '')
  const [estadoMar, setEstadoMar] = useState<EstadoMarId | ''>(inicial?.estadoMar ?? '')
  const [enfoque, setEnfoque] = useState<EnfoqueId | ''>(inicial?.enfoque ?? '')
  const [publicado, setPublicado] = useState(inicial?.publicado ?? false)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const { pendiente, error, ejecutar } = useAccion()

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    setErrores({})
    const ok = await ejecutar(async () => {
      const r = await guardarTemaAdmin(inicial?.slug ?? null, { titulo, slug, descripcion, estadoMar: estadoMar || null, enfoque: enfoque || null, publicado })
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
    <form onSubmit={guardar} noValidate className="flex flex-col gap-5 rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-5 shadow-suave md:p-8">
      <h2 className="text-titulo-s font-normal">Datos del tema</h2>
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
        etiqueta="Ventana"
        value={estadoMar}
        onChange={(e) => setEstadoMar(e.target.value as EstadoMarId | '')}
        opciones={[{ valor: '', texto: 'Sin ventana' }, ...estados.map((s) => ({ valor: s.id, texto: s.nombre }))]}
      />
      {errores.estadoMar && <p className="-mt-3 text-meta text-mar-coral">{errores.estadoMar}</p>}
      <div className="flex flex-col gap-2">
        <Selector
          etiqueta="Enfoque"
          value={enfoque}
          onChange={(e) => setEnfoque(e.target.value as EnfoqueId | '')}
          opciones={[{ valor: '', texto: 'Sin enfoque' }, ...enfoques.map((f) => ({ valor: f.id, texto: f.nombre }))]}
        />
        <p className="text-meta text-mar-tintaSuave">
          {enfoques.find((f) => f.id === enfoque)?.descripcion ?? 'Desde dónde se mira el tema. Sirve para filtrar el catálogo.'}
        </p>
      </div>
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
      <Interruptor etiqueta="Publicado" ayuda={publicado ? 'Aparece en el catálogo del sitio.' : 'Borrador: solo lo ves vos.'} activo={publicado} onCambio={setPublicado} />
      {error && <Aviso>{error}</Aviso>}
      <div>
        <Boton type="submit" disabled={pendiente} aria-busy={pendiente}>
          {pendiente ? 'Guardando…' : inicial ? 'Guardar los cambios' : 'Crear el tema'}
        </Boton>
      </div>
    </form>
  )
}
