import { estados, type EstadoId } from '../../data/estados'
import Seccion from '../Seccion'
import TituloSeccion from '../TituloSeccion'
import TarjetaEstado from './TarjetaEstado'

type Props = { activo: EstadoId | null; onElegir: (id: EstadoId) => void }

// La metáfora como navegación: el usuario ubica su estado y de ahí llega a las ventanas.
export default function EstadosDelMar({ activo, onElegir }: Props) {
  return (
    <Seccion fondo="agua">
      <TituloSeccion
        titulo="¿Cómo está tu mar hoy?"
        texto="Empezá por donde estás. Cada estado abre las ventanas que le corresponden."
      />
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-[18px]">
        {estados.map((estado) => (
          <li key={estado.id}>
            <TarjetaEstado
              estado={estado}
              activo={activo === estado.id}
              onElegir={() => onElegir(estado.id)}
            />
          </li>
        ))}
      </ul>
    </Seccion>
  )
}
