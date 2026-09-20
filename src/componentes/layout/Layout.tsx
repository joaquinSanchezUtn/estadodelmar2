import ConmutadorDev from '../../auth/ConmutadorDev'
import Manchas from '../objetos/Manchas'
import Encabezado from './Encabezado'
import PaginasAnimadas from './PaginasAnimadas'
import PieDePagina from './PieDePagina'

// overflow-x-clip (y no hidden) recorta lo que se sale sin volver este contenedor un
// scroll: el encabezado sigue pegado arriba. overflow-anchor: none, ver PaginasAnimadas.
export default function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-mar-nube [overflow-anchor:none]">
      <Manchas cantidad={2} />
      <Encabezado />
      <PaginasAnimadas />
      <PieDePagina />
      {import.meta.env.DEV && <ConmutadorDev />}
    </div>
  )
}
