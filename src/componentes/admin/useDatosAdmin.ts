import { listarTemasAdmin } from '../../datos/contenido'
import { listarEstadosAdmin } from '../../datos/estados'
import { useSesion } from '../../auth/SesionContext'
import { useCarga, vaciarCache } from '../../lib/useCarga'

// Los temas (con borradores y piezas) y las ventanas (también las ocultas, para poder asignarlas), para toda
// pantalla del panel. Después de un cambio en el lugar se llama `reintentar()` (vuelve a pedir sin vaciar la
// pantalla); antes de ir a otra pantalla, `descartarAdmin()`, para que esa no arranque con lo viejo.
export function useDatosAdmin() {
  const { rol } = useSesion()
  const carga = useCarga(`admin:${rol}`, async () => {
    const [temas, estados] = await Promise.all([listarTemasAdmin(), listarEstadosAdmin()])
    return { temas, estados }
  })
  return carga
}

export const descartarAdmin = vaciarCache
