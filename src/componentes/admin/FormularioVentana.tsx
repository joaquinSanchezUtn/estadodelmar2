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

type Props = { inicial?: TemaAdmin; ventana?: EstadoMarId | null; estados: EstadoMar[]; onGuardado: (slug: string, eraNueva: boolean) => void }

const MAXIMO = 240
const enfoques = listarEnfoques()

// Los datos de un tema: título, descripción y si se ve. Lo que casi nunca hace falta tocar (pasarlo a otra
// ventana, el enfoque y la dirección web, que se arma sola con el título) queda guardado en «Más opciones», que
// se abre solo si ahí hay algo para corregir. Un tema nuevo ya nace en la ventana desde la que se lo creó.
export default function FormularioVentana({ inicial, ventana, estados, onGuardado }: Props) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '')
  const [slug, setSlug] = useState(inicial?.slug ?? '')
  const [slugTocado, setSlugTocado] = useState(Boolean(inicial))
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '')
  const [estadoMar, setEstadoMar] = useState<EstadoMarId | ''>(inicial?.estadoMar ?? ventana ?? '')
  const [enfoque, setEnfoque] = useState<EnfoqueId | ''>(inicial?.enfoque ?? '')
  const [publicado, setPublicado] = useState(inicial?.publicado ?? false)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const { pendiente, error, ejecutar } = useAccion()
  const errorEscondido = Boolean(errores.slug || errores.estadoMar || errores.enfoque)

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
    if (!ok) setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
  }

  return (
    <form onSubmit={guardar} noValidate className="flex flex-col gap-6 rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-5 shadow-suave md:p-8">
      <h2 className="text-titulo-m">{inicial ? 'Nombre y descripción' : 'Datos del tema'}</h2>
      <Campo
        etiqueta="Nombre del tema"
        value={titulo}
        onChange={(e) => {
          setTitulo(e.target.value)
          if (!slugTocado) setSlug(aSlug(e.target.value))
        }}
        ayuda="Por ejemplo: Ansiedad, Pareja, Miedos."
        error={errores.titulo}
        autoComplete="off"
      />
      <div className="flex flex-col gap-2">
        <AreaTexto
          etiqueta="Descripción"
          rows={3}
          maxLength={MAXIMO}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          ayuda={`Una o dos líneas que cuentan de qué trata. La puede leer cualquiera, aunque no esté suscripta. (${descripcion.length} de ${MAXIMO} letras)`}
          aria-invalid={errores.descripcion ? true : undefined}
        />
        {errores.descripcion && <p className="text-meta text-mar-coral">{errores.descripcion}</p>}
      </div>
      <Interruptor
        etiqueta="Mostrar en el sitio"
        ayuda={publicado ? 'Sí: el tema se ve en su ventana.' : 'No: queda oculto, solo lo ves vos. Prendelo cuando esté listo.'}
        activo={publicado}
        onCambio={setPublicado}
      />

      <details open={errorEscondido || undefined} className="rounded-tarjeta border border-mar-bordeAgua p-4">
        <summary className="min-h-control-sm cursor-pointer content-center text-cuerpo font-bold text-mar-primario">Más opciones (casi nunca hacen falta)</summary>
        <div className="mt-4 flex flex-col gap-5">
          <Selector
            etiqueta="¿En qué ventana va?"
            value={estadoMar}
            onChange={(e) => setEstadoMar(e.target.value as EstadoMarId | '')}
            opciones={[{ valor: '', texto: 'En ninguna' }, ...estados.map((s) => ({ valor: s.id, texto: s.nombre }))]}
          />
          {errores.estadoMar && <p className="-mt-3 text-meta text-mar-coral">{errores.estadoMar}</p>}
          <div className="flex flex-col gap-2">
            <Selector
              etiqueta="Enfoque"
              value={enfoque}
              onChange={(e) => setEnfoque(e.target.value as EnfoqueId | '')}
              opciones={[{ valor: '', texto: 'Sin enfoque' }, ...enfoques.map((f) => ({ valor: f.id, texto: f.nombre }))]}
            />
            <p className="text-meta text-mar-tintaSuave">{enfoques.find((f) => f.id === enfoque)?.descripcion ?? 'Desde dónde se mira el tema. Es opcional.'}</p>
          </div>
          <Campo
            etiqueta="Dirección web"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value)
              setSlugTocado(true)
            }}
            ayuda={`Se arma sola con el nombre: /tema/${slug || 'el-nombre'}${inicial ? '. Si la cambiás, los enlaces viejos dejan de andar.' : ''}`}
            error={errores.slug}
            autoComplete="off"
          />
        </div>
      </details>

      {error && <Aviso>{error}</Aviso>}
      <div>
        <Boton type="submit" disabled={pendiente} aria-busy={pendiente}>
          {pendiente ? 'Guardando…' : inicial ? 'Guardar los cambios' : 'Crear el tema'}
        </Boton>
      </div>
    </form>
  )
}
