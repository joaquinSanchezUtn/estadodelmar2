import AvisoSinConexion from '../soporte/AvisoSinConexion'
import LimiteDeErrores from '../soporte/LimiteDeErrores'
import Grano from '../objetos/Grano'
import Manchas from '../objetos/Manchas'
import { useLocation } from 'react-router-dom'
import Encabezado from './Encabezado'
import FraseDelDia from './FraseDelDia'
import PaginasAnimadas from './PaginasAnimadas'
import PieDePagina from './PieDePagina'

// overflow-x-clip (y no hidden) recorta lo que se sale sin volver este contenedor un
// scroll: el encabezado sigue pegado arriba. overflow-anchor: none, ver PaginasAnimadas.
export default function Layout() {
  // Las frases del día (Semillas del mar y Ecos del océano) son para quien visita, no para el panel.
  const { pathname } = useLocation()

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
      {!pathname.startsWith('/admin') && (
        <>
          <FraseDelDia seccion="semillas" />
          <FraseDelDia seccion="ecos" />
        </>
      )}
    </div>
  )
}
