import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSesion } from '../../auth/SesionContext'
import { transicion } from '../../animaciones/movimiento'
import type { Rol } from '../../datos/tipos'
import Boton from '../base/Boton'
import { Menu } from '../base/iconos'
import MenuMovil, { type Enlace } from './MenuMovil'

const ventanas: Enlace = { to: '/#ventanas', texto: 'Ventanas' }
const cuenta: Enlace = { to: '/mi-cuenta', texto: 'Mi cuenta' }

// Lo que se ofrece en el menú según el rol. Es solo navegación: el acceso
// real a cada pantalla lo decide la base.
function opcionesPara(rol: Rol): { enlaces: Enlace[]; cta?: Enlace } {
  if (rol === 'admin') return { enlaces: [ventanas, cuenta, { to: '/admin', texto: 'Administrar' }] }
  if (rol === 'suscriptora') return { enlaces: [ventanas, cuenta] }
  if (rol === 'registrada') {
    return { enlaces: [ventanas, cuenta], cta: { to: '/#suscripcion', texto: 'Suscribirme' } }
  }
  return {
    enlaces: [
      ventanas,
      { to: '/#suscripcion', texto: 'Suscripción' },
      { to: '/ingresar', texto: 'Ingresar' },
    ],
    cta: { to: '/#suscripcion', texto: 'Suscribirme' },
  }
}

export default function Encabezado() {

  const { rol } = useSesion()
  const { key } = useLocation()
  const [abierto, setAbierto] = useState(false)
  const [elevado, setElevado] = useState(false)
  const botonMenu = useRef<HTMLButtonElement>(null)
  const cerrar = useCallback(() => setAbierto(false), [])
  const { enlaces, cta } = opcionesPara(rol)

  // Al scrollear el encabezado gana fondo translúcido, desenfoque y una sombra mínima.
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => setElevado(y > 8))

  useEffect(cerrar, [key, cerrar]) // al navegar, el panel se cierra

  return (
    <header className="sticky top-0 z-40">
      <motion.div
        aria-hidden="true"
        animate={{ opacity: elevado ? 1 : 0 }}
        transition={transicion.media}
        className="pointer-events-none absolute inset-0 border-b border-mar-bordeCielo bg-mar-nube/75 shadow-[0_1px_18px_-8px_rgba(30,58,76,0.2)] backdrop-blur-md"
      />
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-2 md:px-8 md:py-4 lg:px-16">
        <Link
          to="/"
          className="inline-flex min-h-[44px] items-center font-titulo text-lg text-mar-tinta no-underline md:text-[21px]"
        >
          Estado del mar
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-6 text-[15px] md:flex lg:gap-8">
          {enlaces.map((e) => (
            <Link
              key={e.to}
              to={e.to}
              className="inline-flex min-h-[44px] items-center text-mar-tintaSuave no-underline hover:text-mar-tinta"
            >
              {e.texto}
            </Link>
          ))}
          {cta && (
            <Boton to={cta.to} compacto>
              {cta.texto}
            </Boton>
          )}
        </nav>

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

      <AnimatePresence>
        {abierto && <MenuMovil enlaces={enlaces} cta={cta} onCerrar={cerrar} retorno={botonMenu} />}
      </AnimatePresence>
    </header>
  )
}
