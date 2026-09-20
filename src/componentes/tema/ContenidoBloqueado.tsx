import { Link } from 'react-router-dom'
import { useSesion } from '../../auth/SesionContext'
import { obtenerSuscripcion } from '../../datos/contenido'
import { useCarga } from '../../lib/useCarga'
import type { EstadoMarId, Pieza } from '../../datos/tipos'
import Burbuja from '../base/Burbuja'
import PiezaBloqueada from './PiezaBloqueada'

type Props = { piezas: Pieza[]; estado: EstadoMarId | null }

const textos = {
  'sin-plan': {
    titulo: 'Esta ventana es para suscriptoras',
    texto: 'Con un solo plan accedés a todas las ventanas y a las que se vayan sumando. La suscripción se activa desde Mi cuenta.',
  },
  vencida: {
    titulo: 'Tu suscripción venció',
    texto: 'Perdiste el acceso a las ventanas hasta que la reactives. Podés hacerlo desde Mi cuenta en un momento.',
  },
  pendiente: {
    titulo: 'Estamos esperando tu pago',
    texto: 'Apenas se acredite, esta ventana se abre sola. Podés ver cómo va desde Mi cuenta.',
  },
}

// Vista sin acceso: las piezas con su duración detrás de un vidrio esmerilado, y una burbuja
// que invita a suscribirse.
export default function ContenidoBloqueado({ piezas, estado }: Props) {
  const { usuario, rol } = useSesion() // para decidir a dónde mandar y qué decir: Mi cuenta o Ingresar
  // Quien tuvo una suscripción y la perdió (o está esperando que se acredite) necesita otro mensaje.
  // Solo se pide con sesión: para un visitante no hay nada que consultar.
  const { datos: suscripcion } = useCarga(`suscripcion:${usuario?.email ?? 'anonimo'}:${rol}`, async () =>
    usuario ? obtenerSuscripcion() : null,
  )
  const motivo = suscripcion?.estado === 'vencida' ? 'vencida' : suscripcion?.estado === 'pendiente' ? 'pendiente' : 'sin-plan'

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <ul className="flex flex-col gap-4">
        {piezas.map((pieza) => (
          <PiezaBloqueada key={pieza.tipo} pieza={pieza} estado={estado} />
        ))}
      </ul>

      <Burbuja tono="espuma" entrada="ninguna" className="p-6 text-center md:p-8">
        <h2 className="mb-2 text-titulo-m font-normal">{textos[motivo].titulo}</h2>
        <p className="mx-auto mb-5 max-w-angosto text-cuerpo text-mar-tintaSuave">{textos[motivo].texto}</p>
        <Link to={usuario ? '/mi-cuenta' : '/ingresar'} className="inline-flex min-h-control-sm items-center underline">
          {usuario ? 'Ir a Mi cuenta' : 'Ingresá o creá tu cuenta'}
        </Link>
      </Burbuja>
    </div>
  )
}
