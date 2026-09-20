import { estadoPorId, type EstadoId } from '../../data/estados'
import { temas } from '../../data/temas'
import Seccion from '../Seccion'
import TituloSeccion from '../TituloSeccion'
import TarjetaVentana from './TarjetaVentana'

type Props = { estado: EstadoId | null; onVerTodas: () => void }

export default function Ventanas({ estado, onVerTodas }: Props) {
  const visibles = estado ? temas.filter((t) => t.estado === estado) : temas
  const sinResultados = visibles.length === 0

  return (
    <Seccion id="ventanas" fondo="arena">
      <TituloSeccion
        titulo="Las ventanas"
        texto="Cada ventana reúne un video psicoeducativo, una meditación y una ejercitación para poner en práctica. Los títulos los ve cualquiera; el contenido es para suscriptoras."
      />

      {estado && (
        <p className="-mt-2 mb-5 flex flex-wrap items-center gap-x-3 text-base text-mar-tintaSuave">
          <span>
            Mostrando: <strong className="font-bold text-mar-tinta">{estadoPorId(estado).nombre}</strong>
          </span>
          <button
            type="button"
            onClick={onVerTodas}
            className="min-h-[44px] text-mar-agua underline-offset-2 hover:underline"
          >
            Ver todas
          </button>
        </p>
      )}

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[18px]">
        {visibles.map((tema) => (
          <li key={tema.slug}>
            <TarjetaVentana tema={tema} />
          </li>
        ))}
        {(!estado || sinResultados) && (
          <li className="flex flex-col justify-center gap-1.5 rounded-xl border border-dashed border-mar-bordeArena bg-mar-marfil/60 p-5">
            <span className="font-titulo text-lg text-mar-tintaSuave">Se van sumando</span>
            <span className="text-sm leading-relaxed text-mar-tintaSuave">
              {sinResultados
                ? 'Todavía no hay ventanas en este estado.'
                : 'Armonía familiar, Miedos, y los temas transpersonales que vengan.'}
            </span>
          </li>
        )}
      </ul>
    </Seccion>
  )
}
