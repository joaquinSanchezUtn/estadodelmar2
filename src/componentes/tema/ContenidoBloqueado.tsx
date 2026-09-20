import { useSesion } from '../../auth/SesionContext'
import type { EstadoMarId, Pieza } from '../../datos/tipos'
import Boton from '../base/Boton'
import Burbuja from '../base/Burbuja'
import PiezaBloqueada from './PiezaBloqueada'

type Props = { piezas: Pieza[]; estado: EstadoMarId | null }

// Vista sin acceso: las piezas con su duración detrás de un vidrio esmerilado, y una burbuja
// que invita a suscribirse.
export default function ContenidoBloqueado({ piezas, estado }: Props) {
  const { usuario } = useSesion() // solo para no ofrecer "ya tengo cuenta" a quien ya la tiene

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <ul className="flex flex-col gap-3.5">
        {piezas.map((pieza) => (
          <PiezaBloqueada key={pieza.tipo} pieza={pieza} estado={estado} />
        ))}
      </ul>

      <Burbuja tono="espuma" entrada="ninguna" className="p-6 text-center md:p-8">
        <h2 className="mb-2 text-[22px] font-normal">Esta ventana es para suscriptoras</h2>
        <p className="mx-auto mb-5 max-w-md text-base leading-relaxed text-mar-tintaSuave">
          Con un solo plan accedés a todas las ventanas y a las que se vayan sumando.
        </p>
        <div className="mx-auto flex max-w-xs flex-col gap-2">
          <Boton to="/#suscripcion">Suscribirme</Boton>
          {!usuario && (
            <Boton to="/ingresar" variante="fantasma">
              Ya tengo cuenta
            </Boton>
          )}
        </div>
      </Burbuja>
    </div>
  )
}
