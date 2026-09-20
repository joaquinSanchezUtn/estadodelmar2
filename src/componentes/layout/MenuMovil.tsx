import { motion } from 'motion/react'
import { useEffect, useRef, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { abrirPanel, fundido } from '../../animaciones/movimiento'
import Boton from '../base/Boton'
import { Cerrar } from '../base/iconos'

export type Enlace = { to: string; texto: string }

type Props = {
  enlaces: Enlace[]
  cta?: Enlace
  onCerrar: () => void
  // Botón al que vuelve el foco al cerrar (Safari no enfoca los botones al hacer clic).
  retorno: RefObject<HTMLElement | null>
}

// Panel a pantalla completa que entra con el resorte suave; sus enlaces entran en cascada.
// Se cierra con Escape, con la X y al navegar. Mantiene el foco adentro mientras está
// abierto y lo devuelve al cerrar.
export default function MenuMovil({ enlaces, cta, onCerrar, retorno }: Props) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const escritorio = window.matchMedia('(min-width: 768px)')
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLElement>('button')?.focus()

    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onCerrar()
      if (e.key !== 'Tab') return
      const foco = panel.current?.querySelectorAll<HTMLElement>('a[href], button')
      if (!foco?.length) return
      const primero = foco[0]
      const ultimo = foco[foco.length - 1]
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primero.focus()
      }
    }
    const alAgrandar = (e: MediaQueryListEvent) => e.matches && onCerrar()

    document.addEventListener('keydown', alTeclado)
    escritorio.addEventListener('change', alAgrandar)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', alTeclado)
      escritorio.removeEventListener('change', alAgrandar)
      retorno.current?.focus()
    }
  }, [onCerrar, retorno])

  return (
    <motion.div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Menú principal"
      variants={abrirPanel}
      initial="cerrado"
      animate="abierto"
      exit="cerrado"
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-mar-nube md:hidden"
    >
      <div className="flex items-center justify-between border-b border-mar-bordeCielo px-5 py-2">
        <Link to="/" onClick={onCerrar} className="inline-flex min-h-[44px] items-center font-titulo text-lg text-mar-tinta no-underline">
          Estado del mar
        </Link>
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={onCerrar}
          className="flex h-11 w-11 items-center justify-center text-mar-tinta"
        >
          <Cerrar />
        </button>
      </div>

      <nav aria-label="Principal" className="flex flex-col px-6 py-4">
        {enlaces.map((e) => (
          <motion.div key={e.to} variants={fundido}>
            <Link
              to={e.to}
              onClick={onCerrar}
              className="block border-b border-mar-bordeCielo py-4 font-titulo text-2xl text-mar-tinta no-underline"
            >
              {e.texto}
            </Link>
          </motion.div>
        ))}
        {cta && (
          <motion.div variants={fundido} className="mt-6">
            <Boton to={cta.to} onClick={onCerrar} className="w-full">
              {cta.texto}
            </Boton>
          </motion.div>
        )}
      </nav>
    </motion.div>
  )
}
