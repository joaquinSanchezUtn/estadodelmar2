import Burbuja from '../componentes/base/Burbuja'
import EstadoVacio from '../componentes/base/EstadoVacio'
import DibujoEstado from '../componentes/objetos/DibujoEstado'
import { RADIO_OJO_DE_BUEY } from '../animaciones/movimiento'

export default function NoEncontrada() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 md:pt-12">
      <Burbuja tono="aguaClara" entrada="ninguna" interior="grid gap-6 md:grid-cols-[1fr_200px] md:items-center">
        <EstadoVacio
          titulo="Esta página no existe"
          texto="Puede que el enlace esté mal escrito o que la página se haya movido."
          enlace={{ to: '/', texto: 'Volver al inicio' }}
        />
        {/* El horizonte: una línea con un círculo apoyado encima. */}
        <div
          className="order-first aspect-[3/1] overflow-hidden bg-mar-espuma md:order-last md:aspect-square"
          style={{ borderRadius: RADIO_OJO_DE_BUEY }}
        >
          <DibujoEstado estado="horizonte" vivo="siempre" autonomo className="text-mar-agua" />
        </div>
      </Burbuja>
    </div>
  )
}
