import { Link } from 'react-router-dom'
import { useSesion } from '../../auth/SesionContext'
import type { EstadoMar, Tema } from '../../datos/tipos'
import Esqueleto from '../base/Esqueleto'
import Seccion from '../layout/Seccion'
import TituloSeccion from '../layout/TituloSeccion'
import TarjetaVentana from './TarjetaVentana'

type Props = { temas: Tema[] | null; estados: EstadoMar[] | null; activo: EstadoMar | null }

export default function Ventanas({ temas, estados, activo }: Props) {
  const { accesoActivo } = useSesion()
  const visibles = temas && activo ? temas.filter((t) => t.estadoMar === activo.id) : temas
  const vacio = visibles?.length === 0
  const nombreDe = (t: Tema) => estados?.find((e) => e.id === t.estadoMar)?.nombre

  return (
    <Seccion id="ventanas" fondo="arena">
      <TituloSeccion
        titulo="Las ventanas"
        texto="Cada ventana reúne un video psicoeducativo, una meditación y una ejercitación para poner en práctica. Los títulos los ve cualquiera; el contenido es para suscriptoras."
      />

      {activo && (
        <p className="-mt-2 mb-5 flex flex-wrap items-center gap-x-3 text-base text-mar-tintaSuave">
          <span>
            Mostrando: <strong className="font-bold text-mar-tinta">{activo.nombre}</strong>
          </span>
          <Link to="/#ventanas" className="inline-flex min-h-[44px] items-center hover:underline">
            Ver todas
          </Link>
        </p>
      )}

      <ul
        aria-busy={!visibles}
        className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-[18px]"
      >
        {visibles
          ? visibles.map((tema) => (
              <li key={tema.slug}>
                <TarjetaVentana tema={tema} estadoNombre={nombreDe(tema)} bloqueada={!accesoActivo} />
              </li>
            ))
          : Array.from({ length: 4 }, (_, i) => (
              <li key={i}>
                <Esqueleto className="h-[150px]" />
              </li>
            ))}
        {visibles && (!activo || vacio) && (
          <li className="flex flex-col justify-center gap-1.5 rounded-xl border border-dashed border-mar-bordeArena bg-mar-marfil/60 p-5">
            <span className="font-titulo text-lg text-mar-tintaSuave">Se van sumando</span>
            <span className="text-sm leading-relaxed text-mar-tintaSuave">
              {vacio
                ? 'Todavía no hay ventanas en este estado.'
                : 'Nuevas ventanas se suman con el tiempo.'}
            </span>
          </li>
        )}
      </ul>
    </Seccion>
  )
}
