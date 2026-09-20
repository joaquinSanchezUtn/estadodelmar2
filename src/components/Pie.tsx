// Pendiente: las páginas legales todavía no existen.
const legales = ['Términos', 'Privacidad', 'Contacto']

export default function Pie() {
  return (
    <footer className="border-t border-mar-bordeArena bg-mar-marfil">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-[15px] text-mar-tintaSuave lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-8">
        <span>Estado del mar</span>
        <nav aria-label="Legales" className="flex gap-6">
          {legales.map((texto) => (
            <a key={texto} href="#" className="py-2 text-mar-tintaSuave hover:text-mar-tinta">
              {texto}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
