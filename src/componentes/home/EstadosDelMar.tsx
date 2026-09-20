import type { EstadoMar, EstadoMarId } from '../../datos/tipos'
import Esqueleto from '../base/Esqueleto'
import Seccion from '../layout/Seccion'
import TituloSeccion from '../layout/TituloSeccion'
import TarjetaEstado from './TarjetaEstado'

type Props = { estados: EstadoMar[] | null; activo: EstadoMarId | null }

// La metáfora como navegación: la persona ubica su estado y de ahí llega a las ventanas.
export default function EstadosDelMar({ estados, activo }: Props) {
  return (
    <Seccion fondo="agua">
      <TituloSeccion
        titulo="¿Cómo está tu mar hoy?"
        texto="Empezá por donde estás. Cada estado abre las ventanas que le corresponden."
      />
      <ul
        aria-busy={!estados}
        className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-[18px]"
      >
        {estados
          ? estados.map((estado) => (
              <li key={estado.id}>
                <TarjetaEstado estado={estado} activo={activo === estado.id} />
              </li>
            ))
          : Array.from({ length: 8 }, (_, i) => (
              <li key={i}>
                <Esqueleto className="h-[92px]" />
              </li>
            ))}
      </ul>
    </Seccion>
  )
}
