import Burbuja from '../componentes/base/Burbuja'
import EstadoVacio from '../componentes/base/EstadoVacio'
import Pagina from '../componentes/layout/Pagina'
import DibujoEstado from '../componentes/objetos/DibujoEstado'
import { coloresEstado } from '../componentes/objetos/estados/colores'
import ReflejoVidrio from '../componentes/ventana/ReflejoVidrio'
import { cn } from '../lib/cn'
import { RADIO_OJO_DE_BUEY } from '../animaciones/movimiento'

export default function NoEncontrada() {
  return (
    <Pagina ancho="lectura" className="pt-6 md:pt-12">
      <Burbuja tono="aguaClara" entrada="ninguna" interior="grid gap-6 md:grid-cols-[1fr_200px] md:items-center">
        <EstadoVacio
          titulo="Esta página no existe"
          texto="Puede que el enlace esté mal escrito o que la página se haya movido."
          enlace={{ to: '/', texto: 'Volver al inicio' }}
        />
        {/* El horizonte: una línea con un círculo apoyado encima. */}
        <div
          className={cn(
            'relative order-first aspect-[3/1] overflow-hidden border-3 shadow-ventana ring-1 md:order-last md:aspect-square',
            coloresEstado.horizonte.agua,
            coloresEstado.horizonte.aro,
            coloresEstado.horizonte.aroExterior,
          )}
          style={{ borderRadius: RADIO_OJO_DE_BUEY }}
        >
          <DibujoEstado estado="horizonte" vivo="siempre" autonomo />
          <ReflejoVidrio />
        </div>
      </Burbuja>
    </Pagina>
  )
}
