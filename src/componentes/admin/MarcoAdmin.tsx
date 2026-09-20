import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Burbuja from '../base/Burbuja'
import Pagina from '../layout/Pagina'
import NavegacionAdmin from './NavegacionAdmin'

export type Miga = { texto: string; to?: string }
type Props = { titulo: string; migas?: Miga[]; acciones?: ReactNode; children: ReactNode }

// El marco de toda pantalla del panel: navegación, migas de pan, título y, a la derecha, las acciones.
export default function MarcoAdmin({ titulo, migas, acciones, children }: Props) {
  return (
    <Pagina ancho="ancho">
      <Burbuja tono="aguaClara" entrada="ninguna" interior="flex flex-col gap-6">
        <NavegacionAdmin />
        <div className="flex flex-col gap-3">
          {migas && (
            <nav aria-label="Ubicación" className="flex flex-wrap items-center gap-2 text-meta text-mar-tintaSuave">
              {migas.map((m, i) => (
                <span key={`${i}-${m.texto}`} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {m.to ? (
                    <Link to={m.to} className="inline-flex min-h-control-sm items-center hover:underline">
                      {m.texto}
                    </Link>
                  ) : (
                    <span aria-current="page">{m.texto}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-titulo-m font-light md:text-titulo-l">{titulo}</h1>
            {acciones && <div className="flex flex-wrap gap-3">{acciones}</div>}
          </div>
        </div>
        {children}
      </Burbuja>
    </Pagina>
  )
}
