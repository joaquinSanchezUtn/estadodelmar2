import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Pagina from '../layout/Pagina'
import NavegacionAdmin from './NavegacionAdmin'

export type Miga = { texto: string; to?: string }
type Props = { titulo: string; migas?: Miga[]; acciones?: ReactNode; children: ReactNode }

// El marco de toda pantalla del panel: una cabecera cálida con las secciones (como Mi cuenta), las migas de
// pan, el título y, a la derecha, las acciones. El contenido va en tarjetas blancas sobre el fondo de página.
export default function MarcoAdmin({ titulo, migas, acciones, children }: Props) {
  return (
    <Pagina ancho="ancho">
      <header className="flex flex-col gap-4 rounded-burbujaGrande border border-mar-bordeAgua bg-gradient-to-br from-mar-arena via-mar-nube to-mar-aguaClara p-5 shadow-suave md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-etiqueta uppercase text-mar-atardecerTexto">Tu panel</p>
          <Link to="/" className="inline-flex min-h-control-sm items-center font-bold text-mar-primario no-underline hover:underline">
            Ver el sitio →
          </Link>
        </div>
        <NavegacionAdmin />
      </header>

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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-titulo-l">{titulo}</h1>
          {acciones && <div className="flex flex-wrap gap-3">{acciones}</div>}
        </div>
      </div>
      {children}
    </Pagina>
  )
}
