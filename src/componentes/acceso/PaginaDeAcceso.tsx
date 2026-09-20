import type { ReactNode } from 'react'
import Burbuja from '../base/Burbuja'
import Pagina from '../layout/Pagina'
import Olas from '../objetos/Olas'

type Props = { titulo: string; texto?: ReactNode; children?: ReactNode }

// El marco de toda pantalla de acceso: una burbuja angosta con olas al pie, título y bajada.
export default function PaginaDeAcceso({ titulo, texto, children }: Props) {
  return (
    <Pagina ancho="angosto" className="pt-6 md:pt-12">
      <Burbuja tono="blanco" entrada="ninguna" decoracion={<Olas className="h-20 md:h-24" />} className="pb-20 md:pb-24">
        <h1 className="mb-2 text-titulo-m font-light md:text-titulo-l">{titulo}</h1>
        {texto && <p className="mb-8 text-cuerpo text-mar-tintaSuave">{texto}</p>}
        {children}
      </Burbuja>
    </Pagina>
  )
}
