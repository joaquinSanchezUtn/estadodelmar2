import type { EstadoMar, Tema, TipoContenido } from '../../datos/tipos'
import { cn } from '../../lib/cn'
import { minutos } from '../../lib/formato'
import Tarjeta from '../base/Tarjeta'
import { IconoCandado } from '../base/iconos'
import DibujoEstado from '../objetos/DibujoEstado'
import { coloresDe } from '../objetos/estados/colores'

const nombres: Record<TipoContenido, string> = { video: 'Video', meditacion: 'Meditación', ejercitacion: 'Ejercitación' }

type Props = { tema: Tema; estado: EstadoMar | undefined; bloqueada: boolean }

// Un tema como tarjeta: arriba, una ventanita al mar de su estado; abajo, el estado, el título y las piezas
// que de verdad tiene publicadas (sale de `temas.piezas`, lo público: nunca contenido premium).
export default function TarjetaTema({ tema, estado, bloqueada }: Props) {
  const c = coloresDe(estado?.estilo ?? null)

  return (
    <Tarjeta to={`/tema/${tema.slug}`} className="flex h-full flex-col overflow-hidden p-0 shadow-suave">
      <span className={cn('relative flex h-32 items-center justify-center', c.fondo)}>
        <span aria-hidden="true" className={cn('relative block size-24 overflow-hidden rounded-full border-3 shadow-ojo', c.agua, c.aro)}>
          <DibujoEstado estado={estado?.estilo ?? null} />
        </span>
        {bloqueada && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-mar-blanco/90 px-3 py-1 text-meta font-bold text-mar-tinta">
            <IconoCandado /> Suscriptoras
          </span>
        )}
      </span>
      <span className="flex flex-1 flex-col gap-2 p-5">
        {estado && <span className="text-etiqueta uppercase text-mar-atardecerTexto">{estado.nombre}</span>}
        <span className="font-titulo text-titulo-s text-mar-tinta">{tema.titulo}</span>
        <span className="mt-auto flex flex-wrap gap-2 pt-2">
          {tema.piezas.length === 0 ? (
            <span className="text-meta text-mar-tintaSuave">Próximamente</span>
          ) : (
            tema.piezas.map((p) => (
              <span key={p.tipo} className="rounded-full border border-mar-bordeAgua bg-mar-nube px-3 py-1 text-meta font-medium text-mar-tintaSuave">
                {nombres[p.tipo]}
                {p.duracionMin ? ` · ${minutos(p.duracionMin)}` : ''}
              </span>
            ))
          )}
        </span>
      </span>
    </Tarjeta>
  )
}
