import { useSearchParams } from 'react-router-dom'
import EstadosDelMar from '../componentes/home/EstadosDelMar'
import LaPropuesta from '../componentes/home/LaPropuesta'
import PlanMensual from '../componentes/home/PlanMensual'
import Portada from '../componentes/home/Portada'
import Ventanas from '../componentes/home/Ventanas'
import { listarEstados, listarTemas } from '../datos/contenido'
import { useCarga } from '../lib/useCarga'

export default function Home() {

  const [params] = useSearchParams()
  const { datos: estados } = useCarga('estados', listarEstados)
  const { datos: temas } = useCarga('temas', listarTemas)

  // El filtro vive en la URL (?estado=agitado): se puede compartir y anda el "atrás".
  const activo = estados?.find((e) => e.id === params.get('estado')) ?? null

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-16 pt-4 md:gap-8 md:px-6 md:pb-24">
      <Portada />
      <EstadosDelMar estados={estados} activo={activo?.id ?? null} />
      <Ventanas temas={temas} estados={estados} activo={activo} />
      <LaPropuesta />
      <PlanMensual />
    </div>
  )
}
