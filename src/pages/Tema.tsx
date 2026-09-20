import { useParams } from 'react-router-dom'
import { useSesion } from '../auth/SesionContext'
import EstadoVacio from '../componentes/base/EstadoVacio'
import Esqueleto from '../componentes/base/Esqueleto'
import Seccion from '../componentes/layout/Seccion'
import CabeceraTema from '../componentes/tema/CabeceraTema'
import ContenidoAbierto from '../componentes/tema/ContenidoAbierto'
import ContenidoBloqueado from '../componentes/tema/ContenidoBloqueado'
import { listarEstados, obtenerTema } from '../datos/contenido'
import { useCarga } from '../lib/useCarga'

export default function Tema() {
  const { slug = '' } = useParams()
  const { rol } = useSesion()

  // El rol solo dispara la nueva consulta cuando cambia la sesión. Qué se muestra
  // lo decide lo que devuelve obtenerTema, no la sesión.
  const { datos, cargando } = useCarga(async () => {
    const [tema, estados] = await Promise.all([obtenerTema(slug), listarEstados()])
    return { tema, estados }
  }, [slug, rol])

  if (cargando || !datos) {
    return (
      <Seccion fondo="degrade" angosta className="flex flex-col gap-4" >
        <p role="status" className="sr-only">
          Cargando la ventana…
        </p>
        <Esqueleto className="h-6 w-40" />
        <Esqueleto className="h-14 w-3/4" />
        <Esqueleto className="h-24" />
      </Seccion>
    )
  }

  const { tema, estados } = datos

  if (!tema) {
    return (
      <Seccion fondo="marfil" angosta>
        <EstadoVacio
          titulo="No encontramos esa ventana"
          texto="Puede que el enlace esté mal escrito o que la ventana ya no esté disponible."
          enlace={{ to: '/#ventanas', texto: 'Ver todas las ventanas' }}
        />
      </Seccion>
    )
  }

  const estado = estados.find((e) => e.id === tema.estadoMar) ?? null

  return (
    <>
      <CabeceraTema tema={tema} estado={estado} />
      <Seccion fondo="agua" angosta className="pt-2 md:pt-4">
        {tema.acceso === 'abierto' ? (
          <ContenidoAbierto contenidos={tema.contenidos} />
        ) : (
          <ContenidoBloqueado piezas={tema.piezas} />
        )}
      </Seccion>
    </>
  )
}
