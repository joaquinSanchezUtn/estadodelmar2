import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { eliminarTemaAdmin } from '../datos/contenido'
import { useAccion } from '../lib/useAccion'
import Aviso from '../componentes/base/Aviso'
import Boton from '../componentes/base/Boton'
import Esqueleto from '../componentes/base/Esqueleto'
import EstadoVacio from '../componentes/base/EstadoVacio'
import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import ConfirmarAccion from '../componentes/admin/ConfirmarAccion'
import FormularioVentana from '../componentes/admin/FormularioVentana'
import MarcoAdmin from '../componentes/admin/MarcoAdmin'
import PiezasDeVentana from '../componentes/admin/PiezasDeVentana'
import { descartarAdmin, useDatosAdmin } from '../componentes/admin/useDatosAdmin'

// Crear una ventana o editar una existente. En una existente, además, sus piezas y la opción de eliminarla.
export default function AdminEditorVentana() {
  const { slug } = useParams()
  const nueva = !slug
  const navegar = useNavigate()
  const estadoDeNavegacion = useLocation().state as { aviso?: string } | null
  const { datos, cargando, error, reintentar } = useDatosAdmin()
  const [aviso, setAviso] = useState<string | null>(estadoDeNavegacion?.aviso ?? null)
  const [eliminando, setEliminando] = useState(false)
  const baja = useAccion()
  const tema = datos?.temas.find((t) => t.slug === slug)

  const guardado = (nuevoSlug: string, eraNueva: boolean) => {
    if (eraNueva || nuevoSlug !== slug) {
      descartarAdmin()
      navegar(`/admin/ventanas/${nuevoSlug}`, { replace: !eraNueva, state: { aviso: eraNueva ? 'Creaste la ventana. Ahora agregale sus piezas.' : 'Guardamos los cambios.' } })
    } else {
      setAviso('Guardamos los cambios.')
      reintentar()
    }
  }

  const eliminar = () =>
    baja.ejecutar(async () => {
      const r = await eliminarTemaAdmin(slug ?? '')
      if (!r.ok) return r.mensaje
      descartarAdmin()
      navegar('/admin/ventanas', { replace: true })
      return null
    })

  const migas = [{ texto: 'Panel', to: '/admin' }, { texto: 'Ventanas', to: '/admin/ventanas' }, { texto: nueva ? 'Nueva' : (tema?.titulo ?? '…') }]
  const titulo = nueva ? 'Nueva ventana' : (tema?.titulo ?? 'Ventana')

  if (!nueva && !cargando && !error && datos && !tema) {
    return (
      <MarcoAdmin titulo="Ventana" migas={migas}>
        <EstadoVacio titulo="Esa ventana no existe" texto="Puede que la hayan eliminado." enlace={{ to: '/admin/ventanas', texto: 'Ver todas las ventanas' }} />
      </MarcoAdmin>
    )
  }

  return (
    <MarcoAdmin
      titulo={titulo}
      migas={migas}
      acciones={
        tema && (
          <Boton compacto variante="secundario" to={`/tema/${tema.slug}`}>
            Vista previa
          </Boton>
        )
      }
    >
      {error ? (
        <ErrorDeCarga texto="No pudimos leer la ventana." onReintentar={reintentar} />
      ) : cargando || !datos ? (
        <div role="status" className="flex flex-col gap-3">
          <p className="sr-only">Cargando la ventana…</p>
          <Esqueleto className="h-96" />
        </div>
      ) : (
        <>
          {aviso && <Aviso tono="info">{aviso}</Aviso>}
          <FormularioVentana key={tema?.slug ?? 'nueva'} inicial={tema} estados={datos.estados} onGuardado={guardado} />
          {tema && (
            <>
              <PiezasDeVentana tema={tema} />
              <section className="rounded-tarjeta border border-mar-bordeAgua bg-mar-blanco p-5 md:p-6">
                <h2 className="mb-2 text-titulo-s font-normal">Eliminar la ventana</h2>
                <p className="mb-4 text-cuerpo text-mar-tintaSuave">Se borran la ventana y todas sus piezas, con sus archivos. Si solo querés que deje de verse, desmarcá «Publicada».</p>
                {eliminando ? (
                  <ConfirmarAccion titulo={`¿Eliminar «${tema.titulo}»?`} texto="No se puede deshacer." confirmar="Sí, eliminar la ventana" pendiente={baja.pendiente} error={baja.error} onConfirmar={eliminar} onCancelar={() => setEliminando(false)} />
                ) : (
                  <Boton compacto variante="secundario" onClick={() => setEliminando(true)}>
                    Eliminar la ventana
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
