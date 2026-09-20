import EstadosDelMar from '../componentes/home/EstadosDelMar'
import LaPropuesta from '../componentes/home/LaPropuesta'
import PlanMensual from '../componentes/home/PlanMensual'
import Portada from '../componentes/home/Portada'
import Ventanas from '../componentes/home/Ventanas'
import Pagina from '../componentes/layout/Pagina'
import { listarEstados, listarTemas } from '../datos/contenido'
import { useCarga } from '../lib/useCarga'

export default function Home() {

  const { datos: estados } = useCarga('estados', listarEstados, true)
  const { datos: temas } = useCarga('temas', listarTemas, true)

  return (
    <Pagina ancho="ancho">
      <Portada />
      <EstadosDelMar estados={estados} temas={temas} />
      <Ventanas temas={temas} estados={estados} />
      <LaPropuesta />
      <PlanMensual />
    </Pagina>
  )
}
