import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useSesion } from '../auth/SesionContext'
import Pagina from '../componentes/layout/Pagina'
import SinDestino from '../componentes/soporte/SinDestino'
import CabeceraTema from '../componentes/tema/CabeceraTema'
import ContenidoTema from '../componentes/tema/ContenidoTema'
import { listarEstados, obtenerTema } from '../datos/contenido'
import { useCarga } from '../lib/useCarga'

export default function Tema() {
  const { slug = '' } = useParams()
  const { rol, accesoActivo } = useSesion()

  // La sesión solo entra en la clave para volver a pedir el tema cuando cambia (lo que decide
  // el acceso es accesoActivo, no el nombre del rol). Qué se muestra lo decide lo que
  // devuelve obtenerTema, no la sesión.
  const { datos } = useCarga(`tema:${slug}:${rol}:${accesoActivo}`, async () => {
    const [tema, estados] = await Promise.all([obtenerTema(slug), listarEstados()])
    return { slug, tema, estados }
  })

  // Al ganar acceso se conserva la vista bloqueada mientras llega la nueva: así el vidrio se
  // despeja en su lugar en vez de vaciarse la pantalla. Solo se recuerda lo BLOQUEADO (público):
  // nunca lo premium, que al perder el acceso tiene que salir del DOM en el mismo instante.
  const ultimoBloqueado = useRef<typeof datos>(null)
  if (datos?.tema?.acceso === 'bloqueado') ultimoBloqueado.current = datos
  const previo = ultimoBloqueado.current?.slug === slug ? ultimoBloqueado.current : null
  const vista = datos ?? previo

  if (vista && !vista.tema) {
    return <SinDestino titulo="No encontramos ese tema" texto="Puede que el enlace esté mal escrito o que el tema ya no esté disponible." />
  }

  const tema = vista?.tema ?? null
  const estado = vista?.estados.find((e) => e.id === tema?.estadoMar) ?? null

  return (
    <Pagina ancho="lectura">
      <CabeceraTema slug={slug} tema={tema} estado={estado} />
      {tema && <ContenidoTema tema={tema} estilo={estado?.estilo ?? null} />}
    </Pagina>
  )
}
