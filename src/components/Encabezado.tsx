import { useState } from 'react'
import { Link } from 'react-router-dom'
import Boton from './Boton'
import { Cerrar, Menu } from './iconos'

const enlaces = [
  { to: '/#ventanas', texto: 'Ventanas' },
  { to: '/#suscripcion', texto: 'Suscripción' },
  { to: '/ingresar', texto: 'Ingresar' },
]

export default function Encabezado() {
  // Provisorio: en celular el menú se despliega con el botón; el catálogo
  // de estados y ventanas queda siempre visible en la home.
  const [abierto, setAbierto] = useState(false)
  const cerrar = () => setAbierto(false)

  return (
    <header className="border-b border-mar-bordeArena bg-mar-marfil">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-2 lg:px-16 lg:py-[18px]">
        <Link
          to="/"
          onClick={cerrar}
          className="font-titulo text-lg text-mar-tinta no-underline lg:text-[21px]"
        >
          Estado del mar
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-8 text-[15px] lg:flex">
          {enlaces.map((e) => (
            <Link
              key={e.to}
              to={e.to}
              className="text-mar-tintaSuave no-underline hover:text-mar-tinta"
            >
              {e.texto}
            </Link>
          ))}
          <Boton to="/#suscripcion" compacto>
            Suscribirme
          </Boton>
        </nav>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center text-mar-tinta lg:hidden"
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
          aria-controls="menu-movil"
          onClick={() => setAbierto(!abierto)}
        >
          {abierto ? <Cerrar /> : <Menu />}
        </button>
      </div>

      {abierto && (
        <nav
          id="menu-movil"
          aria-label="Principal"
          className="flex flex-col border-t border-mar-bordeArena px-5 py-2 lg:hidden"
        >
          {enlaces.map((e) => (
            <Link
              key={e.to}
              to={e.to}
              onClick={cerrar}
              className="py-3 text-base text-mar-tinta no-underline"
            >
              {e.texto}
            </Link>
          ))}
          <Boton to="/#suscripcion" onClick={cerrar} className="my-3">
            Suscribirme
          </Boton>
        </nav>
      )}
    </header>
  )
}
