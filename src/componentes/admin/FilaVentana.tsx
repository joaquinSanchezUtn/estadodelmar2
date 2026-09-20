import { useState } from 'react'
import { Link } from 'react-router-dom'
import { eliminarTemaAdmin, moverTemaAdmin, publicarTemaAdmin } from '../../datos/contenido'
import type { EstadoMar, ResultadoAdmin, TemaAdmin } from '../../datos/tipos'
import { useAccion } from '../../lib/useAccion'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import { Abajo, Arriba } from '../base/iconos'
import Sello from '../base/Sello'
import ConfirmarAccion from './ConfirmarAccion'

type Props = {
  tema: TemaAdmin
  estados: EstadoMar[]
  posicion: number
  total: number
  // Ordenar solo tiene sentido con la lista completa a la vista.
  puedeOrdenar: boolean
  onCambio: (aviso: string) => void
}

const icono = 'flex size-11 items-center justify-center rounded-full border border-mar-bordeAgua bg-mar-blanco text-mar-tinta hover:bg-mar-aguaClara disabled:opacity-40'

// Una ventana en la lista: subir y bajar, publicar o despublicar, editar, ver y eliminar.
export default function FilaVentana({ tema, estados, posicion, total, puedeOrdenar, onCambio }: Props) {
  const [confirmando, setConfirmando] = useState(false)
  const accion = useAccion()
  const estado = estados.find((e) => e.id === tema.estadoMar)?.nombre ?? 'Sin estado'
  const sinArchivo = tema.contenidos.filter((c) => c.tipo !== 'ejercitacion' && !c.archivo).length

  const correr = (hacer: () => Promise<ResultadoAdmin>, aviso: string) =>
    accion.ejecutar(async () => {
      const r = await hacer()
      if (!r.ok) return r.mensaje
      onCambio(aviso)
      return null
    })

  return (
    <li className="rounded-tarjeta border border-mar-bordeAgua bg-mar-blanco p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <Link to={`/admin/ventanas/${tema.slug}`} className="inline-flex min-h-control-sm items-center font-titulo text-titulo-s text-mar-tinta no-underline hover:underline">
              {tema.titulo}
            </Link>
            <Sello tono={tema.publicado ? 'agua' : 'coral'}>{tema.publicado ? 'Publicada' : 'Borrador'}</Sello>
          </div>
          <p className="text-meta text-mar-tintaSuave">
            {estado} · {tema.contenidos.length} {tema.contenidos.length === 1 ? 'pieza' : 'piezas'}
            {sinArchivo > 0 && ` · ${sinArchivo} sin archivo`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {puedeOrdenar && (
            <>
              <button type="button" className={icono} disabled={accion.pendiente || posicion === 0} aria-label={`Subir «${tema.titulo}» (hoy es la ${posicion + 1} de ${total})`} onClick={() => correr(() => moverTemaAdmin(tema.slug, 'arriba'), `«${tema.titulo}» subió al puesto ${posicion}.`)}>
                <Arriba />
              </button>
              <button type="button" className={icono} disabled={accion.pendiente || posicion === total - 1} aria-label={`Bajar «${tema.titulo}» (hoy es la ${posicion + 1} de ${total})`} onClick={() => correr(() => moverTemaAdmin(tema.slug, 'abajo'), `«${tema.titulo}» bajó al puesto ${posicion + 2}.`)}>
                <Abajo />
              </button>
            </>
          )}
          <Boton compacto variante="secundario" disabled={accion.pendiente} onClick={() => correr(() => publicarTemaAdmin(tema.slug, !tema.publicado), tema.publicado ? `«${tema.titulo}» pasó a borrador.` : `«${tema.titulo}» ya está publicada.`)}>
            {tema.publicado ? 'Despublicar' : 'Publicar'}
          </Boton>
          <Boton compacto to={`/admin/ventanas/${tema.slug}`}>
            Editar
          </Boton>
          <Boton compacto variante="fantasma" onClick={() => setConfirmando(true)} aria-expanded={confirmando}>
            Eliminar
          </Boton>
        </div>
      </div>

      {accion.error && !confirmando && <Aviso className="mt-4">{accion.error}</Aviso>}
      {confirmando && (
        <div className="mt-4">
          <ConfirmarAccion
            titulo={`¿Eliminar «${tema.titulo}»?`}
            texto="Se borran la ventana y todas sus piezas, con sus archivos. No se puede deshacer. Si solo querés que deje de verse, despublicala."
            confirmar="Sí, eliminar la ventana"
            pendiente={accion.pendiente}
            error={accion.error}
            onConfirmar={() => correr(() => eliminarTemaAdmin(tema.slug), `Eliminaste «${tema.titulo}».`)}
            onCancelar={() => setConfirmando(false)}
          />
        </div>
      )}
    </li>
  )
}
