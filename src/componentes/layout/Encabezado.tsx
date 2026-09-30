import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSesion } from '../../auth/SesionContext'
import { transicion } from '../../animaciones/movimiento'
import type { Rol } from '../../datos/tipos'
import Boton from '../base/Boton'
import { Menu } from '../base/iconos'
import LogoDelSitio from './LogoDelSitio'
import MenuCuenta from './MenuCuenta'
import MenuMovil, { type Enlace } from './MenuMovil'

// El mismo recorrido para todos: por dónde empezar, los temas, las meditaciones y quién acompaña. Es solo
// navegación: el acceso real a cada pantalla lo decide la base. Quien tiene cuenta encuentra lo suyo en el
// menú del ícono (MenuCuenta).
const recorrido: Enlace[] = [
  { to: '/#estados', texto: 'Cómo estás hoy' },
  { to: '/ventanas', texto: 'Temas' },
  { to: '/meditaciones', texto: 'Meditaciones' },
  { to: '/quien-soy', texto: 'Quién soy' },
]

// La acción principal de la barra, según el rol: a quien no pagó se le ofrece empezar; a quien ya tiene
// acceso, nada (ya está adentro).
function accionPara(rol: Rol): Enlace | null {
  if (rol === 'visitante') return { to: '/registrarme', texto: 'Empezar' }
  if (rol === 'registrada') return { to: '/mi-cuenta', texto: 'Suscribirme' }
  return null
}

function enlacesPara(rol: Rol): Enlace[] {
  const accion = accionPara(rol)
  return [...recorrido, ...(rol === 'visitante' ? [{ to: '/ingresar', texto: 'Ingresar' }] : []), ...(accion ? [accion] : [])]
}

export default function Encabezado() {

  const { rol } = useSesion()
  const { key } = useLocation()
  const [abierto, setAbierto] = useState(false)
  const [elevado, setElevado] = useState(false)
  const botonMenu = useRef<HTMLButtonElement>(null)
  const cerrar = useCallback(() => setAbierto(false), [])
  const enlaces = enlacesPara(rol)
  const accion = accionPara(rol)

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
        <LogoDelSitio />

        <div className="flex items-center gap-2 md:gap-6 lg:gap-8">
          <nav aria-label="Principal" className="hidden items-center gap-5 text-cuerpo font-medium lg:flex lg:gap-8">
            {recorrido.map((e) => (
              <Link key={e.to} to={e.to} className="inline-flex min-h-control-sm items-center text-mar-tintaSuave no-underline hover:text-mar-tinta">
                {e.texto}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            {rol === 'visitante' && (
              <Link to="/ingresar" className="inline-flex min-h-control-sm items-center px-2 font-bold text-mar-primario no-underline hover:underline">
                Ingresar
              </Link>
            )}
            {accion && (
              <Boton compacto to={accion.to}>
                {accion.texto}
              </Boton>
            )}
          </div>

          <MenuCuenta />

          <button
            ref={botonMenu}
            type="button"
            className="flex h-11 w-11 items-center justify-center text-mar-tinta lg:hidden"
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
