import { RADIO_OJO_DE_BUEY } from '../../animaciones/movimiento'
import { cn } from '../../lib/cn'
import Boton from '../base/Boton'
import AtajosDeEstados from '../estados/AtajosDeEstados'
import Pagina from '../layout/Pagina'
import DibujoEstado from '../objetos/DibujoEstado'
import { coloresEstado } from '../objetos/estados/colores'
import ReflejoVidrio from '../ventana/ReflejoVidrio'

type Props = { titulo: string; texto: string }

// Para cuando el enlace no lleva a ningún lado (página, estado o tema que no existe): en vez de un
// callejón sin salida, el horizonte, dos caminos claros y los estados del mar para volver a orientarse.
export default function SinDestino({ titulo, texto }: Props) {
  return (
    <Pagina ancho="lectura" className="pt-6 md:pt-12">
      <section className="flex flex-col items-center gap-6 rounded-burbujaGrande border border-mar-bordeAgua bg-gradient-to-br from-mar-arena via-mar-nube to-mar-aguaClara p-6 text-center shadow-suave md:p-12">
        {/* El horizonte: una línea con un círculo apoyado encima. */}
        <div
          aria-hidden="true"
          className={cn(
            'relative aspect-square w-40 overflow-hidden border-3 shadow-ventana ring-1 md:w-48',
            coloresEstado.horizonte.agua,
            coloresEstado.horizonte.aro,
            coloresEstado.horizonte.aroExterior,
          )}
          style={{ borderRadius: RADIO_OJO_DE_BUEY }}
        >
          <DibujoEstado estado="horizonte" vivo="siempre" autonomo />
          <ReflejoVidrio />
        </div>
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-titulo-l">{titulo}</h1>
          <p className="max-w-parrafo text-destacado text-mar-tintaSuave">{texto}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Boton to="/">Volver al inicio</Boton>
          <Boton to="/ventanas" variante="secundario">
            Ver todos los temas
          </Boton>
        </div>
        <div className="flex w-full flex-col items-center gap-3 border-t border-mar-bordeAgua pt-6">
          <p className="text-cuerpo font-bold text-mar-tinta">O elegí cómo está tu mar hoy</p>
          <AtajosDeEstados centrado />
        </div>
      </section>
    </Pagina>
  )
}
