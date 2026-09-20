import { Link } from 'react-router-dom'

const legales = [
  { to: '/terminos', texto: 'Términos' },
  { to: '/privacidad', texto: 'Privacidad' },
  { to: '/contacto', texto: 'Contacto' },
]

export default function PieDePagina() {
  return (
    <footer className="border-t border-mar-bordeCielo bg-mar-nube">
      <div className="mx-auto flex max-w-ancho flex-col gap-2 px-4 py-6 text-cuerpo text-mar-tintaSuave md:flex-row md:items-center md:justify-between md:px-16">
        <span>Estado del mar</span>
        <nav aria-label="Legales" className="flex gap-6">
          {legales.map((l) => (
            <Link key={l.to} to={l.to} className="inline-flex min-h-control-sm items-center text-mar-tintaSuave no-underline hover:text-mar-tinta">
              {l.texto}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
