import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { transicion } from '../../animaciones/movimiento'
import { g, SECCIONES_DE_FRASES, type SeccionDeFrases } from '../../datos/seccionesDeFrases'
import { fechaLarga } from '../../lib/formato'
import { numeroDeDia } from '../../lib/fraseDelDia'
import { useFraseDeHoy } from '../../lib/useFraseDeHoy'
import { Cerrar } from '../base/iconos'

// localStorage puede no estar (modo privado, datos bloqueados): es solo para el puntito de "nueva".
const leer = (clave: string) => {
  try {
    return localStorage.getItem(clave)
  } catch {
    return null
  }
}
const guardar = (clave: string, valor: string) => {
  try {
    localStorage.setItem(clave, valor)
  } catch {
    /* sin almacenamiento, el puntito vuelve a aparecer: no importa */
  }
}

// Clases escritas completas (Tailwind no arma clases dinámicas). En celular cada una es un círculo en su
// esquina de abajo; desde `md`, una pestaña vertical pegada a su costado, a media altura.
const lados = {
  derecha: {
    boton: 'right-4 md:right-0 md:rounded-l-burbuja md:rounded-r-none',
    panel: 'right-4 md:right-14',
    desde: 16,
  },
  izquierda: {
    boton: 'left-4 md:left-0 md:rounded-r-burbuja md:rounded-l-none',
    panel: 'left-4 md:left-14',
    desde: -16,
  },
}

const iconos: Record<SeccionDeFrases, string> = {
  // El sol de las Semillas.
  semillas: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  // Las olas de los Ecos.
  ecos: 'M2 9c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0M2 15c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0',
}

// Una pestaña de frase del día: Semillas del mar a la derecha (hasta el 2026-10-03, "Pensamiento del día") y
// Ecos del océano a la izquierda. Al tocarla se abre la frase de hoy: una por día, sin repetirse hasta pasar
// por todas (ver `lib/fraseDelDia`). Sin frases publicadas, no aparece. El puntito avisa que hay una que
// todavía no se vio hoy.
export default function FraseDelDia({ seccion }: { seccion: SeccionDeFrases }) {
  const c = SECCIONES_DE_FRASES[seccion]
  const lado = lados[c.lado]
  const hoy = useMemo(() => new Date(), [])
  const dia = numeroDeDia(hoy)
  const frase = useFraseDeHoy(seccion)
  // La fecha local (no toISOString, que es UTC: de noche en Argentina ya diría mañana).
  const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
  const [abierta, setAbierta] = useState(false)
  const [vista, setVista] = useState(() => leer(c.claveVista) === String(dia))
  const boton = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const id = `frase-del-dia-${seccion}`

  const cerrar = (devolverFoco: boolean) => {
    setAbierta(false)
    if (devolverFoco) boton.current?.focus()
  }

  useEffect(() => {
    if (!abierta) return
    panel.current?.focus()
    if (!vista) {
      guardar(c.claveVista, String(dia))
      setVista(true)
    }
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && cerrar(true)
    const fuera = (e: PointerEvent) => {
      const t = e.target as Node
      if (!panel.current?.contains(t) && !boton.current?.contains(t)) cerrar(false)
    }
    document.addEventListener('keydown', tecla)
    document.addEventListener('pointerdown', fuera)
    return () => {
      document.removeEventListener('keydown', tecla)
      document.removeEventListener('pointerdown', fuera)
    }
  }, [abierta, vista, dia, c.claveVista])

  if (!frase) return null

  return (
    <>
      <button
        ref={boton}
        type="button"
        aria-expanded={abierta}
        aria-controls={id}
        onClick={() => (abierta ? cerrar(false) : setAbierta(true))}
        className={`fixed bottom-4 z-flotante flex size-12 flex-col items-center justify-center gap-2 rounded-full bg-mar-primario text-mar-sobrePrimario shadow-boton transition-colors hover:bg-mar-primarioHover md:bottom-auto md:top-1/2 md:size-auto md:-translate-y-1/2 md:px-2 md:py-4 ${lado.boton}`}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d={iconos[seccion]} />
        </svg>
        <span className="sr-only md:not-sr-only md:rotate-180 md:text-meta md:font-bold md:[writing-mode:vertical-rl]">{c.titulo}</span>
        {!vista && (
          <>
            <span aria-hidden="true" className="size-2 rounded-full bg-mar-atardecer" />
            <span className="sr-only">({g(c, 'nueva', 'nuevo')})</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {abierta && (
          <div className={`fixed bottom-20 z-flotante md:bottom-auto md:top-1/2 md:-translate-y-1/2 ${lado.panel}`}>
            <motion.div
              id={id}
              ref={panel}
              role="dialog"
              aria-label={c.titulo}
              tabIndex={-1}
              initial={{ opacity: 0, x: lado.desde }}
              animate={{ opacity: 1, x: 0, transition: transicion.media }}
              exit={{ opacity: 0, x: lado.desde, transition: transicion.rapida }}
              className="w-72 rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-6 shadow-alzada outline-none md:w-80"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <p className="text-etiqueta uppercase text-mar-atardecerTexto">
                  Tu {c.singular} de hoy · {fechaLarga(fecha)}
                </p>
                <button type="button" onClick={() => cerrar(true)} aria-label={`Cerrar ${g(c, 'la', 'el')} ${c.singular}`} className="-m-2 flex size-10 shrink-0 items-center justify-center rounded-full text-mar-tintaSuave hover:bg-mar-primarioSuave">
                  <Cerrar className="size-5" />
                </button>
              </div>
              <blockquote className="font-titulo text-titulo-s text-mar-tinta">«{frase}»</blockquote>
              <p className="mt-4 text-meta text-mar-tintaSuave">Mañana te espera {g(c, 'otra', 'otro')}.</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
