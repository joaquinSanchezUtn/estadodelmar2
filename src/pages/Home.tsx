import ComoFunciona from '../componentes/home/ComoFunciona'
import EstadosDelMar from '../componentes/home/EstadosDelMar'
import GimnasioDelAlma from '../componentes/home/GimnasioDelAlma'
import MeditacionesInicio from '../componentes/home/MeditacionesInicio'
import PlanMensual from '../componentes/home/PlanMensual'
import Portada from '../componentes/home/Portada'
import PreguntasFrecuentes from '../componentes/home/PreguntasFrecuentes'
import QuienTeAcompana from '../componentes/home/QuienTeAcompana'
import TemasInicio from '../componentes/home/TemasInicio'
import Pagina from '../componentes/layout/Pagina'
import { listarEstados, listarTemas } from '../datos/contenido'
import { hayMeditaciones } from '../lib/meditaciones'
import { useCarga } from '../lib/useCarga'

// El recorrido de la home, en el orden en que alguien nuevo se pregunta las cosas: qué es, cómo funciona,
// cómo estoy (las ventanas), qué hay adentro, quién está detrás, cuánto cuesta y las dudas de siempre.
export default function Home() {
  const { datos: estados } = useCarga('estados', listarEstados, true)
  const { datos: temas } = useCarga('temas', listarTemas, true)

  return (
    <Pagina ancho="ancho" className="gap-0 md:gap-0">
      <Portada />
      <ComoFunciona />
      <EstadosDelMar estados={estados} temas={temas} />
      <TemasInicio temas={temas} estados={estados} />
      {hayMeditaciones(temas) && <MeditacionesInicio temas={temas} />}
      <GimnasioDelAlma conMeditaciones={hayMeditaciones(temas)} />
      <QuienTeAcompana />
      <PlanMensual />
      <PreguntasFrecuentes />
    </Pagina>
  )
}
