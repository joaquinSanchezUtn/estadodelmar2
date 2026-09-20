// Pendiente: las páginas legales todavía no existen.
const legales = ['Términos', 'Privacidad', 'Contacto']

export default function PieDePagina() {
  return (
    <footer className="border-t border-mar-bordeCielo bg-mar-nube">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-[15px] text-mar-tintaSuave md:flex-row md:items-center md:justify-between md:px-8 lg:px-16">
        <span>Estado del mar</span>
        <nav aria-label="Legales" className="flex gap-6">
          {legales.map((texto) => (
            <a key={texto} href="#" className="inline-flex min-h-[44px] items-center text-mar-tintaSuave hover:text-mar-tinta">
              {texto}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
