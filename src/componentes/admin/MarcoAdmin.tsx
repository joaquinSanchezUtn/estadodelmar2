import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { FlechaIzquierda } from '../base/iconos'
import Pagina from '../layout/Pagina'
import NavegacionAdmin from './NavegacionAdmin'

export type Miga = { texto: string; to?: string }
type Props = { titulo: string; migas?: Miga[]; acciones?: ReactNode; children: ReactNode }

// El marco de toda pantalla del panel: una cabecera cálida con las secciones (como Mi cuenta), el camino hasta
// acá («Ventanas › Tormenta › Ansiedad»), un botón grande para volver un paso, el título y, a la derecha, las
// acciones. El botón de volver sale solo de las migas: es la última que tiene enlace, así ninguna pantalla se
// olvida de ponerlo.
export default function MarcoAdmin({ titulo, migas, acciones, children }: Props) {
  const volver = migas?.filter((m) => m.to).at(-1)

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
        {volver?.to && (
          <Link to={volver.to} className="inline-flex min-h-control items-center gap-2 self-start text-destacado font-bold text-mar-primario no-underline hover:underline">
            <FlechaIzquierda className="size-5" />
            Volver a {volver.texto === 'Panel' ? 'Inicio' : volver.texto}
          </Link>
        )}
        {migas && migas.length > 2 && (
          <nav aria-label="Dónde estás" className="flex flex-wrap items-center gap-2 text-cuerpo text-mar-tintaSuave">
            {migas.slice(1).map((m, i) => (
              <span key={`${i}-${m.texto}`} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">›</span>}
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
