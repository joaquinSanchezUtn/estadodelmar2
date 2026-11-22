import type { EstadoMar, Pieza, Tema, TipoContenido } from '../../datos/tipos'
import { cn } from '../../lib/cn'
import { minutos } from '../../lib/formato'
import Tarjeta from '../base/Tarjeta'
import { IconoCandado } from '../base/iconos'
import DibujoEstado from '../objetos/DibujoEstado'
import { coloresDe } from '../objetos/estados/colores'

const nombres: Record<TipoContenido, [string, string]> = { video: ['Video', 'videos'], meditacion: ['Meditación', 'meditaciones'], ejercitacion: ['Ejercitación', 'ejercitaciones'] }
const tipos: TipoContenido[] = ['video', 'meditacion', 'ejercitacion']

// Una pastilla por tipo: con una sola pieza, su duración («Video · 12 min»); con varias, cuántas son («3 videos»).
function resumen(piezas: Pieza[]) {
  return tipos.flatMap((tipo) => {
    const de = piezas.filter((p) => p.tipo === tipo)
    if (de.length === 0) return []
    if (de.length > 1) return [{ tipo, texto: `${de.length} ${nombres[tipo][1]}` }]
    return [{ tipo, texto: `${nombres[tipo][0]}${de[0].duracionMin ? ` · ${minutos(de[0].duracionMin)}` : ''}` }]
  })
}

type Props = { tema: Tema; estado: EstadoMar | undefined; bloqueada: boolean }

// Un tema como tarjeta: arriba, su foto (o, si no tiene, una ventanita al mar con el dibujo del aspecto de su
// ventana); abajo, la ventana, el título y las piezas que de verdad tiene publicadas (sale de `temas.piezas`, lo
// público: nunca contenido premium).
export default function TarjetaTema({ tema, estado, bloqueada }: Props) {
  const c = coloresDe(estado?.estilo ?? null)

  return (
    <Tarjeta to={`/tema/${tema.slug}`} className="flex h-full flex-col overflow-hidden p-0 shadow-suave">
      <span className={cn('relative flex h-32 items-center justify-center overflow-hidden', c.fondo)}>
        {tema.fotoUrl ? (
          <img src={tema.fotoUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span aria-hidden="true" className={cn('relative block size-24 overflow-hidden rounded-full border-3 shadow-ojo', c.agua, c.aro)}>
            <DibujoEstado estado={estado?.estilo ?? null} />
          </span>
        )}
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
            resumen(tema.piezas).map((p) => (
              <span key={p.tipo} className="rounded-full border border-mar-bordeAgua bg-mar-nube px-3 py-1 text-meta font-medium text-mar-tintaSuave">
                {p.texto}
              </span>
            ))
          )}
        </span>
      </span>
    </Tarjeta>
  )
}
