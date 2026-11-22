import { Link } from 'react-router-dom'
import { moverTemaAdmin } from '../../datos/contenido'
import type { EstiloId, ResultadoAdmin, TemaAdmin, TipoContenido } from '../../datos/tipos'
import { cn } from '../../lib/cn'
import { useAccion } from '../../lib/useAccion'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import Sello from '../base/Sello'
import DibujoEstado from '../objetos/DibujoEstado'
import { coloresDe } from '../objetos/estados/colores'
import BotonesDeOrden from './BotonesDeOrden'

type Props = { tema: TemaAdmin; estilo: EstiloId | null; posicion: number; total: number; onCambio: (aviso: string) => void }

const nombres: Record<TipoContenido, [string, string]> = { video: ['video', 'videos'], meditacion: ['meditación', 'meditaciones'], ejercitacion: ['ejercitación', 'ejercitaciones'] }
const tipos: TipoContenido[] = ['video', 'meditacion', 'ejercitacion']

// Qué tiene adentro, en palabras: «2 videos y 1 meditación».
function queTiene(tema: TemaAdmin) {
  const partes = tipos.flatMap((t) => {
    const n = tema.contenidos.filter((c) => c.tipo === t).length
    return n ? [`${n} ${nombres[t][n === 1 ? 0 : 1]}`] : []
  })
  if (partes.length === 0) return 'Todavía vacío'
  return partes.length === 1 ? partes[0] : `${partes.slice(0, -1).join(', ')} y ${partes.at(-1)}`
}

// Un tema adentro de su ventana: su foto, su nombre, qué tiene y si se ve. Tocarlo abre sus videos.
export default function FilaTema({ tema, estilo, posicion, total, onCambio }: Props) {
  const accion = useAccion()
  const correr = (hacer: () => Promise<ResultadoAdmin>, aviso: string) =>
    accion.ejecutar(async () => {
      const r = await hacer()
      if (!r.ok) return r.mensaje
      onCambio(aviso)
      return null
    })
  const abrir = `/admin/ventanas/${tema.slug}`
  const sinArchivo = tema.contenidos.filter((c) => c.tipo !== 'ejercitacion' && !c.archivo).length

  return (
    <li className="rounded-burbuja border-2 border-mar-bordeAgua bg-mar-blanco p-4 shadow-suave md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Link to={abrir} tabIndex={-1} aria-hidden="true" className={cn('relative block h-24 w-full shrink-0 overflow-hidden rounded-tarjeta md:w-32', coloresDe(estilo).agua)}>
          {tema.fotoUrl ? <img src={tema.fotoUrl} alt="" loading="lazy" className="h-full w-full object-cover" /> : <DibujoEstado estado={estilo} />}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Link to={abrir} className="font-titulo text-titulo-m text-mar-tinta no-underline hover:underline">
            {tema.titulo}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Sello tono="neutro">{queTiene(tema)}</Sello>
            <Sello tono={tema.publicado ? 'agua' : 'coral'}>{tema.publicado ? 'Se ve en el sitio' : 'Oculto'}</Sello>
            {sinArchivo > 0 && <Sello tono="coral">{sinArchivo === 1 ? 'A uno le falta el archivo' : `A ${sinArchivo} les falta el archivo`}</Sello>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BotonesDeOrden nombre={tema.titulo} posicion={posicion} total={total} pendiente={accion.pendiente} mover={(d) => moverTemaAdmin(tema.slug, d)} correr={correr} />
          <Boton to={abrir}>Abrir</Boton>
        </div>
      </div>
      {accion.error && <Aviso className="mt-4">{accion.error}</Aviso>}
    </li>
  )
}
