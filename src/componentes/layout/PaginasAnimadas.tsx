import { AnimatePresence, LayoutGroup, motion, useInstantLayoutTransition, useIsPresent } from 'motion/react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type Ref } from 'react'
import { flushSync } from 'react-dom'
import { useLocation, useNavigationType, type NavigationType } from 'react-router-dom'
import { transicionDeRuta, useMovimiento } from '../../animaciones/movimiento'
import Rutas from '../../rutas'

// ── La ventana que se abre ────────────────────────────────────────────────────
// Al hacer clic en una burbuja, la cáscara crece hasta ser la cabecera del tema (y se
// contrae al volver con "atrás"). Motion mide en coordenadas de página, así que mientras
// dura la transición NO se toca el scroll de la ventana: la página que entra se desplaza
// (offset) para caer donde va a quedar y, al terminar, "aterriza": se quita el
// desplazamiento y se coloca el scroll en el mismo instante. Todo esto se comprobó en
// Chrome real (ida, vuelta, interrupción a mitad de camino y entrada directa por URL).
//
// Notas que costaron caro:
//  · overflow-anchor: none. Sin eso Chrome reajusta el scroll a 0 al retirar la página
//    que sale, y la vuelta no restaura la posición.
//  · popLayout exige que el hijo directo reenvíe el ref al nodo del DOM.
//  · <Routes location> congela la ruta de la página que sale.
//  · El scroll lo manejamos nosotros: history.scrollRestoration = 'manual'.

type Config = { grupo: string; compartida: boolean; offset: number; scrollInicial: number; animar: boolean }
type Navegacion = { cambiaPagina: boolean; compartida: boolean; salida: number; scrollInicial: number; hash: string; tipo: NavigationType }

const scrollGuardado = new Map<string, number>()
let contadorGrupos = 0
const esTema = (ruta: string) => ruta.startsWith('/tema/')
// Las pantallas que muestran ojos de buey: la home, el catálogo y la página de cada estado.
const esListado = (ruta: string) => ruta === '/' || ruta === '/ventanas' || ruta.startsWith('/estado/')

// Solo se comparte la cáscara entre un listado de ventanas y un tema: al hacer clic en una ventana o al
// volver con "atrás". Los enlaces con ancla usan solo el fundido.
function esCompartida(desde: string, hacia: string, tipo: NavigationType, hash: string) {
  if (esListado(desde) && esTema(hacia)) return true
  return esTema(desde) && esListado(hacia) && tipo === 'POP' && !hash
}

type PropsPagina = { ref?: Ref<HTMLDivElement>; config: Config; alAterrizar: () => void; children: ReactNode }

function Pagina({ ref, config, alAterrizar, children }: PropsPagina) {
  const presente = useIsPresent()
  const [aterrizada, setAterrizada] = useState(!config.compartida)
  const sinAnimar = useInstantLayoutTransition()

  // El grupo separa las cáscaras de una navegación de las de otra: solo comparten layoutId
  // la burbuja que se abre y la cabecera que la recibe. Se memoiza a propósito: si el
  // elemento se recreara al aterrizar (cambia `aterrizada`), Motion volvería a medir todo
  // el grupo con cajas viejas y las burbujas saltarían.
  const grupo = useMemo(() => <LayoutGroup id={config.grupo}>{children}</LayoutGroup>, [config.grupo, children])

  // El margen y el scroll cambian en el mismo instante y NO se animan: a Motion se le avisa
  // que es un cambio instantáneo de layout. Sin eso, a veces (según la carrera de tiempos)
  // mide las burbujas con la caja vieja y las hace volar desde donde no corresponde.
  const aterrizar = () => {
    if (aterrizada || !presente) return
    sinAnimar(() => {
      flushSync(() => setAterrizada(true))
      window.scrollTo({ top: config.scrollInicial, behavior: 'instant' })
    })
    alAterrizar()
  }

  return (
    <motion.div
      ref={ref}
      data-pagina={presente ? 'entra' : 'sale'}
      className="relative"
      style={aterrizada ? undefined : { marginTop: config.offset }}
      initial={config.animar ? transicionDeRuta.initial : false}
      animate={transicionDeRuta.animate}
      exit={transicionDeRuta.exit}
      transition={transicionDeRuta.transition}
      onAnimationComplete={aterrizar}
    >
      {grupo}
    </motion.div>
  )
}

export default function PaginasAnimadas() {

  const location = useLocation()
  const tipo = useNavigationType()
  const { reducido } = useMovimiento()

  const previa = useRef({ clave: location.key, pathname: location.pathname, sInit: 0, aterrizada: true, grupo: 'g0' })
  const pagina = useRef<Config>({ grupo: 'g0', compartida: false, offset: 0, scrollInicial: 0, animar: false })
  const nav = useRef<Navegacion & { clave: string }>({ clave: location.key, cambiaPagina: false, compartida: false, salida: 0, scrollInicial: 0, hash: location.hash, tipo })

  if (nav.current.clave !== location.key) {
    const p = previa.current
    // Se guarda el scroll "real" de lo que se deja (una página sin aterrizar nunca se movió).
    scrollGuardado.set(p.clave, p.aterrizada ? window.scrollY : p.sInit)
    const cambiaPagina = p.pathname !== location.pathname
    const scrollInicial = tipo === 'POP' ? (scrollGuardado.get(location.key) ?? 0) : 0
    const compartida = cambiaPagina && !reducido && esCompartida(p.pathname, location.pathname, tipo, location.hash)
    nav.current = { clave: location.key, cambiaPagina, compartida, salida: window.scrollY, scrollInicial, hash: location.hash, tipo }
    if (cambiaPagina) {
      const grupo = compartida ? p.grupo : `g${++contadorGrupos}`
      pagina.current = { grupo, compartida, offset: compartida ? window.scrollY - scrollInicial : 0, scrollInicial, animar: true }
      previa.current = { clave: location.key, pathname: location.pathname, sInit: scrollInicial, aterrizada: !compartida, grupo }
    } else {
      previa.current = { ...p, clave: location.key }
    }
  }

  // El navegador no debe restaurar el scroll por su cuenta.
  useEffect(() => {
    window.history.scrollRestoration = 'manual'
  }, [])

  // Cambio de página sin cáscara compartida: se coloca el scroll ya, y la página que sale
  // se congela tal como la veía la persona mientras se desvanece.
  useLayoutEffect(() => {
    const n = nav.current
    if (!n.cambiaPagina || n.compartida) return
    const ancla = n.hash ? document.getElementById(n.hash.slice(1)) : null
    // El encabezado es fijo: el título de la sección tiene que quedar debajo de él.
    const margen = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
    const objetivo = ancla ? Math.max(0, ancla.getBoundingClientRect().top + window.scrollY - margen) : n.scrollInicial
    window.scrollTo({ top: objetivo, behavior: 'instant' })
    document.querySelectorAll<HTMLElement>('[data-pagina="sale"]').forEach((el) => {
      el.style.transform = `translateY(${objetivo - n.salida}px)`
    })
  }, [location.key])

  // Misma página (filtro, ancla): baja suave hasta el ancla, o restaura el scroll al volver.
  useEffect(() => {
    const n = nav.current
    if (n.cambiaPagina) return
    const ancla = n.hash ? document.getElementById(n.hash.slice(1)) : null
    if (ancla) ancla.scrollIntoView()
    else if (n.tipo === 'POP') window.scrollTo({ top: scrollGuardado.get(location.key) ?? 0, behavior: 'instant' })
  }, [location.key])

  return (
    <main className="relative flex-1">
      {/* Sin initial={false}: esa prop apaga las animaciones de montaje de TODOS los descendientes
          y los bucles (olas, burbujitas, manchas) saltarían al último fotograma y quedarían
          quietos en la primera carga. La primera página ya lleva su propio initial={false}. */}
      <AnimatePresence mode="popLayout">
        <Pagina key={location.pathname} config={pagina.current} alAterrizar={() => { previa.current.aterrizada = true }}>
          <Rutas location={location} />
        </Pagina>
      </AnimatePresence>
    </main>
  )
}
