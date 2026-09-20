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
  const { datos: estados } = useCarga(listarEstados, [])
  const { datos: temas } = useCarga(listarTemas, [])

  // El filtro vive en la URL (?estado=agitado): se puede compartir y anda el "atrás".
  const activo = estados?.find((e) => e.id === params.get('estado')) ?? null

  return (
    <>
      <Portada />
      <EstadosDelMar estados={estados} activo={activo?.id ?? null} />
      <Ventanas temas={temas} estados={estados} activo={activo} />
      <LaPropuesta />
      <PlanMensual />
    </>
  )
}
