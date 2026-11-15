import ComoFunciona from '../componentes/home/ComoFunciona'
import EstadosDelMar from '../componentes/home/EstadosDelMar'
import MeditacionesInicio from '../componentes/home/MeditacionesInicio'
import PlanMensual from '../componentes/home/PlanMensual'
import Portada from '../componentes/home/Portada'
import PreguntasFrecuentes from '../componentes/home/PreguntasFrecuentes'
import QuienTeAcompana from '../componentes/home/QuienTeAcompana'
import Pagina from '../componentes/layout/Pagina'
import { listarEstados, listarTemas } from '../datos/contenido'
import { obtenerPortada, portadaInicial } from '../datos/portada'
import { hayMeditaciones } from '../lib/meditaciones'
import { useCarga } from '../lib/useCarga'

// El recorrido de la home, en el orden en que alguien nuevo se pregunta las cosas: qué es, cómo funciona,
// cómo estoy (las ventanas, con los temas adentro), quién está detrás, cuánto cuesta y las dudas de siempre.
export default function Home() {
  const { datos: estados } = useCarga('estados', listarEstados, true)
  const { datos: temas } = useCarga('temas', listarTemas, true)
  // Los textos de la portada y de «Cómo funciona» los edita la dueña. Si la lectura falla (o no trae nada), van los de siempre.
  const { datos: portada, cargando: cargandoPortada } = useCarga('portada', obtenerPortada, true)
  const textos = portada ?? (cargandoPortada ? null : portadaInicial)

  return (
    <Pagina ancho="ancho" className="gap-0 md:gap-0">
      <Portada textos={textos} />
      {textos && <ComoFunciona textos={textos} />}
      <EstadosDelMar estados={estados} temas={temas} />
      {hayMeditaciones(temas) && <MeditacionesInicio temas={temas} />}
      <QuienTeAcompana />
      <PlanMensual />
      <PreguntasFrecuentes />
    </Pagina>
  )
}
