import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import ConfirmarAccion from '../componentes/admin/ConfirmarAccion'
import FormularioEstado from '../componentes/admin/FormularioEstado'
import FotoAdmin from '../componentes/admin/FotoAdmin'
import MarcoAdmin from '../componentes/admin/MarcoAdmin'
import { descartarAdmin, useDatosAdmin } from '../componentes/admin/useDatosAdmin'
import Aviso from '../componentes/base/Aviso'
import Boton from '../componentes/base/Boton'
import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import Esqueleto from '../componentes/base/Esqueleto'
import EstadoVacio from '../componentes/base/EstadoVacio'
import { eliminarEstadoAdmin, quitarFotoEstadoAdmin, subirFotoEstadoAdmin } from '../datos/estados'
import ImagenDeVentana from '../componentes/objetos/ImagenDeVentana'
import { coloresDe } from '../componentes/objetos/estados/colores'
import { cn } from '../lib/cn'
import { useAccion } from '../lib/useAccion'

// Crear una ventana o cambiar una existente («Cambiar esta ventana»): sus textos, si se ve, su foto y la opción de
// eliminarla (solo si no tiene temas). Sus temas están un paso antes, en `AdminVentana`.
export default function AdminEditorEstado() {
  const { id } = useParams()
  const nueva = !id
  const navegar = useNavigate()
  const estadoDeNavegacion = useLocation().state as { aviso?: string } | null
  const { datos, cargando, error, reintentar } = useDatosAdmin()
  const [aviso, setAviso] = useState<string | null>(estadoDeNavegacion?.aviso ?? null)
  const [borrando, setBorrando] = useState(false)
  const baja = useAccion()
  const estado = datos?.estados.find((e) => e.id === id)
  const temas = datos?.temas.filter((t) => t.estadoMar === id).length ?? 0

  const alCambiar = (texto: string) => {
    setAviso(texto)
    descartarAdmin()
  }
  const guardado = (nuevoId: string, eraNueva: boolean) => {
    descartarAdmin()
    if (eraNueva) navegar(`/admin/estados/${nuevoId}`, { state: { aviso: 'Listo, creaste la ventana. Ahora podés agregarle temas. La foto se sube desde «Cambiar esta ventana».' } })
    else setAviso('Guardamos los cambios.')
  }
  const borrar = () =>
    baja.ejecutar(async () => {
      const r = await eliminarEstadoAdmin(id ?? '')
      if (!r.ok) return r.mensaje
      descartarAdmin()
      navegar('/admin/estados', { replace: true })
      return null
    })

  const migas = nueva
    ? [{ texto: 'Panel', to: '/admin' }, { texto: 'Ventanas y temas', to: '/admin/estados' }, { texto: 'Nueva ventana' }]
    : [{ texto: 'Panel', to: '/admin' }, { texto: 'Ventanas y temas', to: '/admin/estados' }, { texto: estado?.nombre ?? '…', to: `/admin/estados/${id}` }, { texto: 'Cambiar' }]

  if (!nueva && !cargando && !error && datos && !estado) {
    return (
      <MarcoAdmin titulo="Ventana" migas={migas}>
        <EstadoVacio titulo="Esa ventana no existe" texto="Puede que la hayan borrado." enlace={{ to: '/admin/estados', texto: 'Ver todas las ventanas' }} />
      </MarcoAdmin>
    )
  }

  return (
    <MarcoAdmin
      titulo={nueva ? 'Nueva ventana' : `Cambiar «${estado?.nombre ?? 'la ventana'}»`}
      migas={migas}
    >
      {error ? (
        <ErrorDeCarga texto="No pudimos leer la ventana." onReintentar={reintentar} />
      ) : !nueva && (cargando || !estado) ? (
        <div role="status">
          <p className="sr-only">Cargando la ventana…</p>
          <Esqueleto className="h-96" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {aviso && <Aviso tono="info">{aviso}</Aviso>}
          <FormularioEstado key={estado?.id ?? 'nueva'} inicial={estado} onGuardado={guardado} />
          {estado && (
            <FotoAdmin
              vista={
                <span aria-hidden="true" className={cn('relative block aspect-[3/2] w-full max-w-parrafo overflow-hidden rounded-tarjeta', coloresDe(estado.estilo).agua)}>
                  <ImagenDeVentana estado={estado} vivo="siempre" autonomo />
                </span>
              }
              tieneFoto={!!estado.fotoUrl}
              sinFoto="el dibujo de su aspecto"
              subir={(foto) => subirFotoEstadoAdmin(estado.id, foto)}
              quitar={() => quitarFotoEstadoAdmin(estado.id)}
              onCambio={alCambiar}
            />
          )}
          {estado && (
            <section aria-labelledby="titulo-borrar" className="flex flex-col gap-3 rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-6 shadow-suave">
              <h2 id="titulo-borrar" className="text-titulo-s font-normal">
                Eliminar la ventana
              </h2>
              {temas > 0 ? (
                <p className="text-cuerpo text-mar-tintaSuave">
                  Tiene {temas} {temas === 1 ? 'tema' : 'temas'} adentro. Para eliminarla, primero pasalos a otra ventana (en cada tema, «Más opciones»). Si solo querés que deje de verse, apagá «Mostrar en el sitio».
                </p>
              ) : borrando ? (
                <ConfirmarAccion
                  titulo={`¿Eliminar «${estado.nombre}»?`}
                  texto="Se borran la ventana y su foto. No se puede deshacer. Si solo querés que deje de verse, apagá «Mostrar en el sitio»."
                  confirmar="Sí, eliminar la ventana"
                  pendiente={baja.pendiente}
                  error={baja.error}
                  onConfirmar={borrar}
                  onCancelar={() => setBorrando(false)}
                />
              ) : (
                <div>
                  <Boton variante="fantasma" onClick={() => setBorrando(true)}>
                    Eliminar la ventana
                  </Boton>
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </MarcoAdmin>
  )
}
