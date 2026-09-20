import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSesion } from '../../auth/SesionContext'
import { transicion } from '../../animaciones/movimiento'
import type { Rol } from '../../datos/tipos'
import { Menu } from '../base/iconos'
import MenuCuenta from './MenuCuenta'
import MenuMovil, { type Enlace } from './MenuMovil'

const ventanas: Enlace = { to: '/ventanas', texto: 'Ventanas' }

// Lo que se ofrece en la barra según el rol. Es solo navegación: el acceso real a cada pantalla
// lo decide la base. Quien tiene cuenta encuentra lo suyo en el menú del ícono (MenuCuenta).
function enlacesPara(rol: Rol): Enlace[] {
  if (rol !== 'visitante') return [ventanas]
  return [ventanas, { to: '/#suscripcion', texto: 'Suscripción' }, { to: '/ingresar', texto: 'Ingresar' }]
}

export default function Encabezado() {

  const { rol } = useSesion()
  const { key } = useLocation()
  const [abierto, setAbierto] = useState(false)
  const [elevado, setElevado] = useState(false)
  const botonMenu = useRef<HTMLButtonElement>(null)
  const cerrar = useCallback(() => setAbierto(false), [])
  const enlaces = enlacesPara(rol)

  // Al scrollear el encabezado gana fondo translúcido, desenfoque y una sombra mínima.
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => setElevado(y > 8))

  useEffect(cerrar, [key, cerrar]) // al navegar, el panel se cierra

  return (
    <header className="sticky top-0 z-encabezado">
      {/* Siempre un vidrio suave detrás; al scrollear se le suman el borde y la sombra. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-mar-nube/70 backdrop-blur-md" />
      <motion.div
        aria-hidden="true"
        animate={{ opacity: elevado ? 1 : 0 }}
        transition={transicion.media}
        className="pointer-events-none absolute inset-0 border-b border-mar-bordeCielo shadow-encabezado"
      />
      <div className="relative mx-auto flex max-w-ancho items-center justify-between px-4 py-2 md:px-16 md:py-4">
        <Link
          to="/"
          className="inline-flex min-h-control-sm items-center font-titulo text-titulo-s text-mar-tinta no-underline"
        >
          Estado del mar
        </Link>

        <div className="flex items-center gap-2 md:gap-6 lg:gap-8">
          <nav aria-label="Principal" className="hidden items-center gap-6 text-cuerpo md:flex lg:gap-8">
            {enlaces.map((e) => (
              <Link
                key={e.to}
                to={e.to}
                className="inline-flex min-h-control-sm items-center text-mar-tintaSuave no-underline hover:text-mar-tinta"
              >
                {e.texto}
              </Link>
            ))}
          </nav>

          <MenuCuenta />

          <button
            ref={botonMenu}
            type="button"
            className="flex h-11 w-11 items-center justify-center text-mar-tinta md:hidden"
            aria-label="Abrir menú"
            aria-expanded={abierto}
            aria-haspopup="dialog"
            onClick={() => setAbierto(true)}
          >
            <Menu />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {abierto && <MenuMovil enlaces={enlaces} onCerrar={cerrar} retorno={botonMenu} />}
      </AnimatePresence>
    </header>
  )
}
