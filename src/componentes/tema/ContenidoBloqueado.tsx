import type { Pieza, TipoContenido } from '../../datos/tipos'
import { minutos } from '../../lib/formato'
import Boton from '../base/Boton'
import Candado from '../base/Candado'

const nombres: Record<TipoContenido, string> = {
  video: 'Video psicoeducativo',
  meditacion: 'Meditación guiada',
  ejercitacion: 'Ejercitación',
}

// Vista sin acceso. Solo usa lo público de cada pieza (tipo y duración): los
// títulos y el contenido son premium y no llegan al navegador.
export default function ContenidoBloqueado({ piezas }: { piezas: Pieza[] }) {
  return (
    <div className="flex flex-col gap-3.5">
      <ul className="flex flex-col gap-3.5">
        {piezas.map((pieza) => (
          <li
            key={pieza.tipo}
            className="flex items-center gap-3.5 rounded-[13px] border border-mar-bordeAgua bg-mar-blanco p-[17px]"
          >
            <Candado etiqueta="Bloqueado" className="h-[22px] w-[22px] text-mar-aguaSuave" />
            <span className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-titulo text-lg">{nombres[pieza.tipo]}</span>
              <span className="text-[15px] text-mar-tintaSuave">{minutos(pieza.duracionMin)}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-2 rounded-2xl border border-mar-bordeArena bg-mar-arenaClara p-6 text-center md:p-8">
        <h2 className="mb-2 text-[22px] font-normal">Esta ventana es para suscriptoras</h2>
        <p className="mx-auto mb-5 max-w-md text-base leading-relaxed text-mar-tintaSuave">
          Con un solo plan accedés a todas las ventanas y a las que se vayan sumando.
        </p>
        <div className="mx-auto flex max-w-xs flex-col gap-2">
          <Boton to="/#suscripcion">Suscribirme</Boton>
          <Boton to="/ingresar" variante="fantasma">
            Ya tengo cuenta
          </Boton>
        </div>
      </div>
    </div>
  )
}
