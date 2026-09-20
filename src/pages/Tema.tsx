import { useParams } from 'react-router-dom'
import { useSesion } from '../auth/SesionContext'
import Burbuja from '../componentes/base/Burbuja'
import EstadoVacio from '../componentes/base/EstadoVacio'
import CabeceraTema from '../componentes/tema/CabeceraTema'
import ContenidoTema from '../componentes/tema/ContenidoTema'
import { listarEstados, obtenerTema } from '../datos/contenido'
import { useCarga } from '../lib/useCarga'

export default function Tema() {
  const { slug = '' } = useParams()
  const { rol } = useSesion()

  // El rol solo entra en la clave para volver a pedir el tema cuando cambia la sesión.
  // Qué se muestra lo decide lo que devuelve obtenerTema, no la sesión.
  const { datos, anteriores } = useCarga(`tema:${slug}:${rol}`, async () => {
    const [tema, estados] = await Promise.all([obtenerTema(slug), listarEstados()])
    return { slug, tema, estados }
  })
  // Al cambiar el rol se conserva lo último visto de esta ventana mientras llega lo nuevo:
  // así el vidrio se despeja en su lugar en vez de vaciarse la pantalla.
  const vista = datos ?? (anteriores?.slug === slug ? anteriores : null)

  if (vista && !vista.tema) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-4 md:px-6">
        <Burbuja tono="aguaClara" entrada="ninguna">
          <EstadoVacio
            titulo="No encontramos esa ventana"
            texto="Puede que el enlace esté mal escrito o que la ventana ya no esté disponible."
            enlace={{ to: '/#ventanas', texto: 'Ver todas las ventanas' }}
          />
        </Burbuja>
      </div>
    )
  }

  const tema = vista?.tema ?? null
  const estado = vista?.estados.find((e) => e.id === tema?.estadoMar) ?? null

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pb-16 pt-4 md:gap-8 md:px-6">
      <CabeceraTema slug={slug} tema={tema} estado={estado} />
      {tema && <ContenidoTema tema={tema} />}
    </div>
  )
}
