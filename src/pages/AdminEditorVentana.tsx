import { useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
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
import { SIN_VENTANA } from '../componentes/admin/seccionesDelPanel'
import { descartarAdmin, useDatosAdmin } from '../componentes/admin/useDatosAdmin'

// El tercer escalón: un tema. Arriba, lo que más se usa (sus videos y demás piezas); abajo, su nombre y
// descripción, su foto y la opción de eliminarlo. Uno nuevo nace en la ventana de `?ventana=`.
export default function AdminEditorVentana() {
  const { slug } = useParams()
  const nueva = !slug
  const ventanaDeUrl = useSearchParams()[0].get('ventana')
  const navegar = useNavigate()
  const estadoDeNavegacion = useLocation().state as { aviso?: string } | null
  const { datos, cargando, error, reintentar } = useDatosAdmin()
  const [aviso, setAviso] = useState<string | null>(estadoDeNavegacion?.aviso ?? null)
  const [eliminando, setEliminando] = useState(false)
  const baja = useAccion()
  const tema = datos?.temas.find((t) => t.slug === slug)
  const ventanaId = nueva ? ventanaDeUrl : (tema?.estadoMar ?? null)
  const ventana = datos?.estados.find((e) => e.id === ventanaId)
  const estilo = ventana?.estilo ?? null
  const volverA = `/admin/estados/${ventana?.id ?? SIN_VENTANA}`
  const alCambiar = (texto: string) => {
    setAviso(texto)
    reintentar()
  }

  const guardado = (nuevoSlug: string, eraNueva: boolean) => {
    descartarAdmin()
    if (eraNueva || nuevoSlug !== slug) {
      navegar(`/admin/ventanas/${nuevoSlug}`, { replace: !eraNueva, state: { aviso: eraNueva ? 'Listo, creaste el tema. Ahora agregale sus videos.' : 'Guardamos los cambios.' } })
    } else alCambiar('Guardamos los cambios.')
  }

  const eliminar = () =>
    baja.ejecutar(async () => {
      const r = await eliminarTemaAdmin(slug ?? '')
      if (!r.ok) return r.mensaje
      descartarAdmin()
      navegar(volverA, { replace: true, state: { aviso: `Eliminaste «${tema?.titulo ?? 'el tema'}».` } })
      return null
    })

  const migas = [
    { texto: 'Panel', to: '/admin' },
    { texto: 'Ventanas y temas', to: '/admin/estados' },
    { texto: ventana?.nombre ?? 'Sin ventana', to: volverA },
    { texto: nueva ? 'Nuevo tema' : (tema?.titulo ?? '…') },
  ]

  if (!nueva && !cargando && !error && datos && !tema) {
    return (
      <MarcoAdmin titulo="Tema" migas={migas.slice(0, 2)}>
        <EstadoVacio titulo="Ese tema no existe" texto="Puede que lo hayan eliminado." enlace={{ to: '/admin/estados', texto: 'Ver las ventanas' }} />
      </MarcoAdmin>
    )
  }

  return (
    <MarcoAdmin
      titulo={nueva ? `Nuevo tema${ventana ? ` en «${ventana.nombre}»` : ''}` : (tema?.titulo ?? 'Tema')}
      migas={migas}
      acciones={
        tema && (
          <Boton variante="secundario" to={`/tema/${tema.slug}`}>
            Ver cómo queda
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
          {tema && !tema.publicado && (
            <Aviso tono="info">Este tema está oculto: las suscriptoras todavía no lo ven. Cuando esté listo, prendé «Mostrar en el sitio» más abajo y guardá.</Aviso>
          )}
          {tema && <PiezasDeVentana tema={tema} onCambio={reintentar} />}
          <FormularioVentana key={tema?.slug ?? 'nueva'} inicial={tema} ventana={ventanaId} estados={datos.estados} onGuardado={guardado} />
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
                onCambio={alCambiar}
              />
              <section className="rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-5 md:p-6">
                <h2 className="mb-2 text-titulo-s font-normal">Eliminar el tema</h2>
                <p className="mb-4 text-cuerpo text-mar-tintaSuave">Se borran el tema y todo lo que tiene adentro, con sus videos. Si solo querés que deje de verse, apagá «Mostrar en el sitio».</p>
                {eliminando ? (
                  <ConfirmarAccion titulo={`¿Eliminar «${tema.titulo}»?`} texto="No se puede deshacer." confirmar="Sí, eliminar el tema" pendiente={baja.pendiente} error={baja.error} onConfirmar={eliminar} onCancelar={() => setEliminando(false)} />
                ) : (
                  <Boton variante="fantasma" onClick={() => setEliminando(true)}>
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
