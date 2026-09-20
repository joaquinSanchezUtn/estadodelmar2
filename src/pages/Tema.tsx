import { useParams, useSearchParams } from 'react-router-dom'
import Boton from '../components/Boton'
import Seccion from '../components/Seccion'
import CabeceraTema from '../components/tema/CabeceraTema'
import ContenidoAbierto from '../components/tema/ContenidoAbierto'
import ContenidoBloqueado from '../components/tema/ContenidoBloqueado'
import { estadoPorId } from '../data/estados'
import { temas } from '../data/temas'

export default function Tema() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const tema = temas.find((t) => t.slug === slug)

  if (!tema) {
    return (
      <Seccion fondo="marfil" angosta className="flex flex-col items-start gap-4">
        <h1 className="text-3xl font-light">No encontramos esa ventana</h1>
        <Boton to="/#ventanas" variante="secundario">
          Ver todas las ventanas
        </Boton>
      </Seccion>
    )
  }

  // Solo para revisar el diseño en desarrollo (?suscripta=1). En producción el
  // acceso lo decide la base con RLS, nunca el navegador: este atajo no existe.
  const abierta = import.meta.env.DEV && params.get('suscripta') === '1'

  return (
    <>
      <CabeceraTema tema={tema} estado={estadoPorId(tema.estado)} />
      <Seccion fondo="agua" angosta className="pt-2 lg:pt-4">
        {abierta ? <ContenidoAbierto /> : <ContenidoBloqueado />}
      </Seccion>
    </>
  )
}
