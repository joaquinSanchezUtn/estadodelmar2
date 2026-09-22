import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSesion } from '../../auth/SesionContext'
import { desplegar } from '../../animaciones/movimiento'
import { Cuenta } from '../base/iconos'

const itemBase =
  'flex min-h-control-sm w-full items-center rounded-control px-3 text-left text-cuerpo text-mar-tinta no-underline hover:bg-mar-aguaClara focus-visible:bg-mar-aguaClara'

// El ícono de la cuenta en la barra: al tocarlo se despliega el menú con lo que la persona puede
// hacer con su cuenta. Es solo navegación: el acceso real a /admin lo decide la base.
export default function MenuCuenta() {
  const { usuario, rol, cerrarSesion } = useSesion()
  const { key } = useLocation()
  const [abierto, setAbierto] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)
  const boton = useRef<HTMLButtonElement>(null)

  const cerrar = useCallback((devolverFoco = false) => {
    setAbierto(false)
    if (devolverFoco) boton.current?.focus()
  }, [])

  useEffect(() => cerrar(), [key, cerrar]) // al navegar, se cierra

  useEffect(() => {
    if (!abierto) return
    raiz.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    const fuera = (e: PointerEvent) => !raiz.current?.contains(e.target as Node) && cerrar()
    document.addEventListener('pointerdown', fuera)
    return () => document.removeEventListener('pointerdown', fuera)
  }, [abierto, cerrar])

  if (!usuario) return null

  const alTeclado = (e: KeyboardEvent) => {
    if (e.key === 'Escape') return cerrar(true)
    if (e.key === 'Tab') return cerrar()
    const items = [...(raiz.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
    const i = items.indexOf(document.activeElement as HTMLElement)
    const destino = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: items.length - 1 }[e.key]
    if (destino === undefined) return
    e.preventDefault()
    items[(destino + items.length) % items.length]?.focus()
  }

  return (
    <div ref={raiz} onKeyDown={abierto ? alTeclado : undefined} className="relative">
      <button
        ref={boton}
        type="button"
        aria-label="Cuenta"
        aria-expanded={abierto}
        aria-haspopup="menu"
        aria-controls="menu-cuenta"
        onClick={() => setAbierto((a) => !a)}
        className="flex size-11 items-center justify-center rounded-full border border-mar-bordeControl bg-mar-blanco/60 text-mar-tinta transition-colors hover:bg-mar-blanco"
      >
        <Cuenta />
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            id="menu-cuenta"
            variants={desplegar}
            initial="cerrado"
            animate="abierto"
            exit="cerrado"
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 top-full mt-2 w-72 rounded-tarjeta border border-mar-bordeAgua bg-mar-blanco p-2 shadow-burbuja"
          >
            <div className="border-b border-mar-bordeAgua px-3 pb-3 pt-2">
              <p className="font-titulo text-titulo-s text-mar-tinta">{usuario.nombre}</p>
              <p className="break-all text-meta text-mar-tintaSuave">{usuario.email}</p>
            </div>
            <ul role="menu" aria-label="Cuenta" className="pt-2">
              <li role="none">
                <Link role="menuitem" to="/mi-cuenta" className={itemBase}>
                  Mi cuenta
                </Link>
              </li>
              {rol === 'admin' && (
                <li role="none">
                  <Link role="menuitem" to="/admin" className={itemBase}>
                    Administrar
                  </Link>
                </li>
              )}
              <li role="none">
                <button role="menuitem" type="button" onClick={cerrarSesion} className={itemBase}>
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
