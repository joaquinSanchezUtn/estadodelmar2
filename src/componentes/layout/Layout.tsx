import AvisoSinConexion from '../soporte/AvisoSinConexion'
import LimiteDeErrores from '../soporte/LimiteDeErrores'
import Grano from '../objetos/Grano'
import Manchas from '../objetos/Manchas'
import Encabezado from './Encabezado'
import PaginasAnimadas from './PaginasAnimadas'
import PieDePagina from './PieDePagina'

// overflow-x-clip (y no hidden) recorta lo que se sale sin volver este contenedor un
// scroll: el encabezado sigue pegado arriba. overflow-anchor: none, ver PaginasAnimadas.
export default function Layout() {
  return (
    <div className="group relative flex min-h-screen flex-col overflow-x-clip bg-mar-nube [overflow-anchor:none]">
      <Grano />
      <Manchas cantidad={2} />
      <AvisoSinConexion />
      <Encabezado />
      <LimiteDeErrores>
        <PaginasAnimadas />
      </LimiteDeErrores>
      <PieDePagina />
    </div>
  )
}
