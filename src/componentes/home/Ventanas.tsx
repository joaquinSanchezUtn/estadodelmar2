import type { EstadoMar, Tema } from '../../datos/tipos'
import Boton from '../base/Boton'
import Burbuja from '../base/Burbuja'
import GrillaDeVentanas from '../ventana/GrillaDeVentanas'
import TituloBurbuja from './TituloBurbuja'

type Props = { temas: Tema[] | null; estados: EstadoMar[] | null }

const sumando = (
  <span className="flex aspect-square w-full max-w-ojo flex-col items-center justify-center gap-2 rounded-full border border-dashed border-mar-aguaSuave p-6 text-center">
    <span className="font-titulo text-titulo-s text-mar-tintaSuave">Se van sumando</span>
    <span className="text-meta text-mar-tintaSuave">Nuevas ventanas se suman con el tiempo.</span>
  </span>
)

export default function Ventanas({ temas, estados }: Props) {
  return (
    <Burbuja id="ventanas" tono="cielo">
      <TituloBurbuja
        titulo="Las ventanas"
        texto="Cada ventana reúne un video psicoeducativo, una meditación y una ejercitación para poner en práctica. Los títulos los ve cualquiera; el contenido es para suscriptoras."
      />
      <GrillaDeVentanas temas={temas} estados={estados} final={sumando} />
      <div className="mt-8 flex justify-center">
        <Boton to="/ventanas" variante="secundario">
          Ver todas y buscar
        </Boton>
      </div>
    </Burbuja>
  )
}
