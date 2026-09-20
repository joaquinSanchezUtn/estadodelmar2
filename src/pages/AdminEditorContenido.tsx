import { useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { eliminarContenidoAdmin } from '../datos/contenido'
import type { TipoContenido } from '../datos/tipos'
import { useAccion } from '../lib/useAccion'
import Aviso from '../componentes/base/Aviso'
import Boton from '../componentes/base/Boton'
import Esqueleto from '../componentes/base/Esqueleto'
import EstadoVacio from '../componentes/base/EstadoVacio'
import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import ConfirmarAccion from '../componentes/admin/ConfirmarAccion'
import FormularioContenido from '../componentes/admin/FormularioContenido'
import MarcoAdmin from '../componentes/admin/MarcoAdmin'
import { descartarAdmin, useDatosAdmin } from '../componentes/admin/useDatosAdmin'
import EjercitacionContenido from '../componentes/tema/EjercitacionContenido'
import Reproductor from '../componentes/reproductor/Reproductor'

const tipos: TipoContenido[] = ['video', 'meditacion', 'ejercitacion']
const nuevas: Record<TipoContenido, string> = { video: 'Nuevo video', meditacion: 'Nueva meditación', ejercitacion: 'Nueva ejercitación' }

// Agregar o editar una pieza de una ventana, con una vista previa de cómo la ven las suscriptoras.
export default function AdminEditorContenido() {
  const { slug = '', id } = useParams()
  const [params] = useSearchParams()
  const navegar = useNavigate()
  const { datos, cargando, error, reintentar } = useDatosAdmin()
  const [aviso, setAviso] = useState<string | null>(null)
  const [eliminando, setEliminando] = useState(false)
  const baja = useAccion()
  const tema = datos?.temas.find((t) => t.slug === slug)
  const pieza = tema?.contenidos.find((c) => c.id === id)
  const tipoDeUrl = tipos.find((t) => t === params.get('tipo'))
  const tipo = pieza?.tipo ?? tipoDeUrl

  if (!id && !tipoDeUrl) return <Navigate to={`/admin/ventanas/${slug}`} replace />

  const migas = [{ texto: 'Panel', to: '/admin' }, { texto: 'Ventanas', to: '/admin/ventanas' }, { texto: tema?.titulo ?? '…', to: `/admin/ventanas/${slug}` }, { texto: pieza?.titulo ?? (tipo ? nuevas[tipo] : '…') }]

  const guardado = (_: string, eraNueva: boolean) => {
    descartarAdmin()
    if (eraNueva) navegar(`/admin/ventanas/${slug}`, { state: { aviso: `Agregaste ${tipo === 'ejercitacion' ? 'la ejercitación' : tipo === 'video' ? 'el video' : 'la meditación'} a la ventana.` } })
    else {
      setAviso('Guardamos los cambios.')
      reintentar()
    }
  }

  const eliminar = () =>
    baja.ejecutar(async () => {
      const r = await eliminarContenidoAdmin(id ?? '')
      if (!r.ok) return r.mensaje
      descartarAdmin()
      navegar(`/admin/ventanas/${slug}`, { replace: true, state: { aviso: 'Eliminaste la pieza.' } })
      return null
    })

  if (!cargando && !error && datos && (!tema || (id && !pieza))) {
    return (
      <MarcoAdmin titulo="Pieza" migas={migas}>
        <EstadoVacio titulo="No encontramos eso" texto="Puede que la ventana o la pieza ya no existan." enlace={{ to: '/admin/ventanas', texto: 'Ver todas las ventanas' }} />
      </MarcoAdmin>
    )
  }

  return (
    <MarcoAdmin titulo={pieza?.titulo ?? (tipo ? nuevas[tipo] : 'Pieza')} migas={migas}>
      {error ? (
        <ErrorDeCarga texto="No pudimos leer la pieza." onReintentar={reintentar} />
      ) : cargando || !datos || !tema || !tipo ? (
        <div role="status" className="flex flex-col gap-3">
          <p className="sr-only">Cargando la pieza…</p>
          <Esqueleto className="h-96" />
        </div>
      ) : (
        <>
          {aviso && <Aviso tono="info">{aviso}</Aviso>}
          <FormularioContenido key={pieza?.id ?? tipo} tema={tema} tipo={tipo} inicial={pieza} onGuardado={guardado} />

          {pieza && (
            <>
              <section aria-labelledby="previa-titulo" className="flex flex-col gap-3 rounded-tarjeta border border-mar-bordeAgua bg-mar-blanco p-5 md:p-6">
                <h2 id="previa-titulo" className="text-titulo-s font-normal">
                  Así la ven las suscriptoras
                </h2>
                {pieza.tipo === 'ejercitacion' ? (
                  <EjercitacionContenido contenido={pieza} />
                ) : (
                  <div className="overflow-hidden rounded-tarjeta border border-mar-bordeAgua">
                    <Reproductor key={pieza.archivo?.nombre ?? 'sin'} tipo={pieza.tipo === 'video' ? 'video' : 'audio'} contenidoId={pieza.id} titulo={pieza.titulo} />
                  </div>
                )}
              </section>

              <section className="rounded-tarjeta border border-mar-bordeAgua bg-mar-blanco p-5 md:p-6">
                <h2 className="mb-2 text-titulo-s font-normal">Eliminar la pieza</h2>
                <p className="mb-4 text-cuerpo text-mar-tintaSuave">Se borra la pieza y su archivo. Si solo querés que deje de verse, desmarcá «Publicada».</p>
                {eliminando ? (
                  <ConfirmarAccion titulo={`¿Eliminar «${pieza.titulo}»?`} texto="No se puede deshacer." confirmar="Sí, eliminar la pieza" pendiente={baja.pendiente} error={baja.error} onConfirmar={eliminar} onCancelar={() => setEliminando(false)} />
                ) : (
                  <Boton compacto variante="secundario" onClick={() => setEliminando(true)}>
                    Eliminar la pieza
                  </Boton>
                )}
              </section>
            </>
          )}
        </>
      )}
    </MarcoAdmin>
  )
}
