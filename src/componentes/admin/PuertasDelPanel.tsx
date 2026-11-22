import { Link } from 'react-router-dom'
import type { Puerta } from './seccionesDelPanel'

type Props = { puertas: (Puerta & { aviso?: string })[] }

// Botones grandes, uno por pantalla: un ícono, el nombre y una línea que dice qué hay adentro. Toda la tarjeta
// es el enlace (más fácil de acertar que un botón chico). `aviso` es una pastilla coral, por ejemplo «2 sin leer».
export default function PuertasDelPanel({ puertas }: Props) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {puertas.map((p) => (
        <li key={p.to}>
          <Link
            to={p.to}
            className="flex h-full items-start gap-4 rounded-burbuja border-2 border-mar-bordeAgua bg-mar-blanco p-6 text-mar-tinta no-underline shadow-suave transition hover:border-mar-primario hover:bg-mar-primarioSuave md:p-8"
          >
            <span aria-hidden="true" className="flex size-16 shrink-0 items-center justify-center rounded-full bg-mar-aguaClara text-titulo-l">
              {p.icono}
            </span>
            <span className="flex flex-col gap-2">
              <span className="flex flex-wrap items-center gap-3">
                <span className="font-titulo text-titulo-m">{p.titulo}</span>
                {p.aviso && <span className="rounded-full bg-mar-primario px-3 py-1 text-meta font-bold text-mar-sobrePrimario">{p.aviso}</span>}
              </span>
              <span className="text-destacado text-mar-tintaSuave">{p.texto}</span>
              <span className="text-cuerpo font-bold text-mar-primario">Entrar →</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
