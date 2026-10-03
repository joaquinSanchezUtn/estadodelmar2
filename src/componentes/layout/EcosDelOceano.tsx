import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { transicion } from '../../animaciones/movimiento'
import { fechaLarga } from '../../lib/formato'
import { numeroDeDia } from '../../lib/ecoDelDia'
import { useEcoDeHoy } from '../../lib/useEcoDeHoy'
import { Cerrar } from '../base/iconos'

// La clave conserva el nombre viejo a propósito: así el cambio de nombre no vuelve a prender el puntito.
const CLAVE = 'estado-del-mar:pensamiento-visto'

// localStorage puede no estar (modo privado, datos bloqueados): es solo para el puntito de "nueva".
const leer = () => {
  try {
    return localStorage.getItem(CLAVE)
  } catch {
    return null
  }
}
const guardar = (valor: string) => {
  try {
    localStorage.setItem(CLAVE, valor)
  } catch {
    /* sin almacenamiento, el puntito vuelve a aparecer: no importa */
  }
}

// Ecos del océano (hasta el 2026-10-03, "Pensamiento del día"): la pestaña del costado derecho; al tocarla
// se abre el eco de hoy. Uno por día, sin repetirse hasta pasar por todos (ver `lib/ecoDelDia`). El puntito avisa que hay uno que todavía no se vio hoy.
export default function EcosDelOceano() {
  const hoy = useMemo(() => new Date(), [])
  const dia = numeroDeDia(hoy)
  const eco = useEcoDeHoy()
  // La fecha local (no toISOString, que es UTC: de noche en Argentina ya diría mañana).
  const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
  const [abierta, setAbierta] = useState(false)
  const [vista, setVista] = useState(() => leer() === String(dia))
  const boton = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  const cerrar = (devolverFoco: boolean) => {
    setAbierta(false)
    if (devolverFoco) boton.current?.focus()
  }

  useEffect(() => {
    if (!abierta) return
    panel.current?.focus()
    if (!vista) {
      guardar(String(dia))
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
  }, [abierta, vista, dia])

  if (!eco) return null

  return (
    <>
      <button
        ref={boton}
        type="button"
        aria-expanded={abierta}
        aria-controls="eco-del-oceano"
        onClick={() => (abierta ? cerrar(false) : setAbierta(true))}
        className="fixed bottom-4 right-4 z-flotante flex size-12 flex-col items-center justify-center gap-2 rounded-full bg-mar-primario text-mar-sobrePrimario shadow-boton transition-colors hover:bg-mar-primarioHover md:bottom-auto md:right-0 md:top-1/2 md:size-auto md:-translate-y-1/2 md:rounded-l-burbuja md:rounded-r-none md:px-2 md:py-4"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
        {/* En celular es un círculo con el ícono en la esquina de abajo: como pestaña al medio del costado tapaba
            botones y textos. Desde `md`, la pestaña vertical con el texto. */}
        <span className="sr-only md:not-sr-only md:rotate-180 md:text-meta md:font-bold md:[writing-mode:vertical-rl]">Ecos del océano</span>
        {!vista && (
          <>
            <span aria-hidden="true" className="size-2 rounded-full bg-mar-atardecer" />
            <span className="sr-only">(nueva)</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {abierta && (
          <div className="fixed bottom-20 right-4 z-flotante md:bottom-auto md:right-14 md:top-1/2 md:-translate-y-1/2">
            <motion.div
              id="eco-del-oceano"
              ref={panel}
              role="dialog"
              aria-label="Ecos del océano"
              tabIndex={-1}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0, transition: transicion.media }}
              exit={{ opacity: 0, x: 16, transition: transicion.rapida }}
              className="w-72 rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-6 shadow-alzada outline-none md:w-80"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <p className="text-etiqueta uppercase text-mar-atardecerTexto">Tu eco de hoy · {fechaLarga(fecha)}</p>
                <button type="button" onClick={() => cerrar(true)} aria-label="Cerrar el eco" className="-m-2 flex size-10 shrink-0 items-center justify-center rounded-full text-mar-tintaSuave hover:bg-mar-primarioSuave">
                  <Cerrar className="size-5" />
                </button>
              </div>
              <blockquote className="font-titulo text-titulo-s text-mar-tinta">«{eco}»</blockquote>
              <p className="mt-4 text-meta text-mar-tintaSuave">Mañana te espera otro.</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
