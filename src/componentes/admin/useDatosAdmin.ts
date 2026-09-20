import { listarEstados, listarTemasAdmin } from '../../datos/contenido'
import { useSesion } from '../../auth/SesionContext'
import { useCarga, vaciarCache } from '../../lib/useCarga'

// Las ventanas (con borradores y piezas) y los estados, para toda pantalla del panel. Después de un
// cambio en el lugar se llama `reintentar()` (vuelve a pedir sin vaciar la pantalla); antes de ir a otra
// pantalla, `descartarAdmin()`, para que esa no arranque con lo viejo.
export function useDatosAdmin() {
  const { rol } = useSesion()
  const carga = useCarga(`admin:${rol}`, async () => {
    const [temas, estados] = await Promise.all([listarTemasAdmin(), listarEstados()])
    return { temas, estados }
  })
  return carga
}

export const descartarAdmin = vaciarCache
