import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { eliminarTemaAdmin, quitarFotoTemaAdmin, subirFotoTemaAdmin } from '../datos/contenido'
import FotoAdmin from '../componentes/admin/FotoAdmin'
import DibujoEstado from '../componentes/objetos/DibujoEstado'
import { coloresDe } from '../componentes/objetos/estados/colores'
import { cn } from '../lib/cn'
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

// Crear un tema o editar uno existente. En uno existente, además, su foto, sus piezas y la opción de eliminarlo.
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
  const estilo = datos?.estados.find((e) => e.id === tema?.estadoMar)?.estilo ?? null
  const alCambiarFoto = (texto: string) => {
    setAviso(texto)
    reintentar()
  }

  const guardado = (nuevoSlug: string, eraNueva: boolean) => {
    if (eraNueva || nuevoSlug !== slug) {
      descartarAdmin()
      navegar(`/admin/ventanas/${nuevoSlug}`, { replace: !eraNueva, state: { aviso: eraNueva ? 'Creaste el tema. Ahora agregale sus piezas.' : 'Guardamos los cambios.' } })
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

  const migas = [{ texto: 'Panel', to: '/admin' }, { texto: 'Temas', to: '/admin/ventanas' }, { texto: nueva ? 'Nuevo' : (tema?.titulo ?? '…') }]
  const titulo = nueva ? 'Nuevo tema' : (tema?.titulo ?? 'Tema')

  if (!nueva && !cargando && !error && datos && !tema) {
    return (
      <MarcoAdmin titulo="Tema" migas={migas}>
        <EstadoVacio titulo="Ese tema no existe" texto="Puede que lo hayan eliminado." enlace={{ to: '/admin/ventanas', texto: 'Ver todos los temas' }} />
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
        <ErrorDeCarga texto="No pudimos leer el tema." onReintentar={reintentar} />
      ) : cargando || !datos ? (
        <div role="status" className="flex flex-col gap-3">
          <p className="sr-only">Cargando el tema…</p>
          <Esqueleto className="h-96" />
        </div>
      ) : (
        <>
          {aviso && <Aviso tono="info">{aviso}</Aviso>}
          <FormularioVentana key={tema?.slug ?? 'nueva'} inicial={tema} estados={datos.estados} onGuardado={guardado} />
          {tema && (
            <>
              <FotoAdmin
                vista={
                  <span aria-hidden="true" className={cn('relative block aspect-[3/2] w-full max-w-parrafo overflow-hidden rounded-tarjeta', coloresDe(estilo).agua)}>
                    {tema.fotoUrl ? <img src={tema.fotoUrl} alt="" className="h-full w-full object-cover" /> : <DibujoEstado estado={estilo} vivo="siempre" autonomo />}
                  </span>
                }
                tieneFoto={!!tema.fotoUrl}
                sinFoto="el dibujo de su ventana"
                subir={(foto) => subirFotoTemaAdmin(tema, foto)}
                quitar={() => quitarFotoTemaAdmin(tema)}
                onCambio={alCambiarFoto}
              />
              <PiezasDeVentana tema={tema} />
              <section className="rounded-tarjeta border border-mar-bordeAgua bg-mar-blanco p-5 md:p-6">
                <h2 className="mb-2 text-titulo-s font-normal">Eliminar el tema</h2>
                <p className="mb-4 text-cuerpo text-mar-tintaSuave">Se borran el tema y todas sus piezas, con sus archivos. Si solo querés que deje de verse, desmarcá «Publicado».</p>
                {eliminando ? (
                  <ConfirmarAccion titulo={`¿Eliminar «${tema.titulo}»?`} texto="No se puede deshacer." confirmar="Sí, eliminar el tema" pendiente={baja.pendiente} error={baja.error} onConfirmar={eliminar} onCancelar={() => setEliminando(false)} />
                ) : (
                  <Boton compacto variante="secundario" onClick={() => setEliminando(true)}>
                    Eliminar el tema
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
