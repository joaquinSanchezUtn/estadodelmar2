import { useState } from 'react'
import { Link } from 'react-router-dom'
import { eliminarEstadoAdmin, moverEstadoAdmin, publicarEstadoAdmin } from '../../datos/estados'
import type { EstadoMarAdmin, ResultadoAdmin } from '../../datos/tipos'
import { cn } from '../../lib/cn'
import { useAccion } from '../../lib/useAccion'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import { Abajo, Arriba } from '../base/iconos'
import Sello from '../base/Sello'
import ImagenDeVentana from '../objetos/ImagenDeVentana'
import { coloresDe } from '../objetos/estados/colores'
import ConfirmarAccion from './ConfirmarAccion'

type Props = { estado: EstadoMarAdmin; temas: number; posicion: number; total: number; onCambio: (aviso: string) => void }

const icono = 'flex size-11 items-center justify-center rounded-full border border-mar-bordeControl bg-mar-blanco text-mar-tinta hover:bg-mar-aguaClara disabled:opacity-40'

// Una ventana en la lista del panel, con lo mismo que un tema: subir y bajar, activar o desactivar, editar y
// eliminar (esto último solo sin temas adentro: la base no lo deja).
export default function FilaEstado({ estado, temas, posicion, total, onCambio }: Props) {
  const [confirmando, setConfirmando] = useState(false)
  const accion = useAccion()
  const correr = (hacer: () => Promise<ResultadoAdmin>, aviso: string) =>
    accion.ejecutar(async () => {
      const r = await hacer()
      if (!r.ok) return r.mensaje
      onCambio(aviso)
      return null
    })

  return (
    <li className="rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-4 shadow-suave">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <span aria-hidden="true" className={cn('relative block h-16 w-24 shrink-0 overflow-hidden rounded-tarjeta', coloresDe(estado.estilo).agua)}>
          <span className="absolute inset-0">
            <ImagenDeVentana estado={estado} />
          </span>
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <Link to={`/admin/estados/${estado.id}`} className="inline-flex min-h-control-sm items-center font-titulo text-titulo-s text-mar-tinta no-underline hover:underline">
              {estado.nombre}
            </Link>
            <Sello tono={estado.publicado ? 'agua' : 'coral'}>{estado.publicado ? 'Activa' : 'Desactivada'}</Sello>
          </div>
          <p className="text-meta text-mar-tintaSuave">
            {temas === 0 ? 'Sin temas' : `${temas} ${temas === 1 ? 'tema' : 'temas'}`}
            {estado.fotoUrl ? ' · con foto' : ' · sin foto'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={icono} disabled={accion.pendiente || posicion === 0} aria-label={`Subir «${estado.nombre}» (hoy es la ${posicion + 1} de ${total})`} onClick={() => correr(() => moverEstadoAdmin(estado.id, 'arriba'), `«${estado.nombre}» subió al puesto ${posicion}.`)}>
            <Arriba />
          </button>
          <button type="button" className={icono} disabled={accion.pendiente || posicion === total - 1} aria-label={`Bajar «${estado.nombre}» (hoy es la ${posicion + 1} de ${total})`} onClick={() => correr(() => moverEstadoAdmin(estado.id, 'abajo'), `«${estado.nombre}» bajó al puesto ${posicion + 2}.`)}>
            <Abajo />
          </button>
          <Boton compacto variante="secundario" disabled={accion.pendiente} onClick={() => correr(() => publicarEstadoAdmin(estado.id, !estado.publicado), estado.publicado ? `Desactivaste «${estado.nombre}»: ya no aparece en el sitio.` : `«${estado.nombre}» ya está activa en el sitio.`)}>
            {estado.publicado ? 'Desactivar' : 'Activar'}
          </Boton>
          <Boton compacto to={`/admin/estados/${estado.id}`}>
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
          {temas > 0 ? (
            <Aviso>
              «{estado.nombre}» tiene {temas} {temas === 1 ? 'tema' : 'temas'} adentro. Para eliminarla, primero pasalos a otra ventana desde Temas. Si solo querés que deje de verse, desactivala.{' '}
              <button type="button" className="font-bold underline" onClick={() => setConfirmando(false)}>
                Entendido
              </button>
            </Aviso>
          ) : (
            <ConfirmarAccion
              titulo={`¿Eliminar «${estado.nombre}»?`}
              texto="Se borran la ventana y su foto. No se puede deshacer. Si solo querés que deje de verse, desactivala."
              confirmar="Sí, eliminar la ventana"
              pendiente={accion.pendiente}
              error={accion.error}
              onConfirmar={() => correr(() => eliminarEstadoAdmin(estado.id), `Eliminaste «${estado.nombre}».`)}
              onCancelar={() => setConfirmando(false)}
            />
          )}
        </div>
      )}
    </li>
  )
}
