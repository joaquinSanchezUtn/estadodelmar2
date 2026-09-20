// Sistema de movimiento del sitio. Ningún componente define curvas ni duraciones
// propias: todo sale de acá. Solo se anima transform, opacity y filter.
import { useReducedMotion, type TargetAndTransition, type Transition, type Variants } from 'motion/react'
import { useMediaQuery } from '../lib/useMediaQuery'

// ── Curvas y tiempos ──────────────────────────────────────────────────────────
// Una sola curva de salida: arranca rápido y se asienta despacio, como el agua.
export const curva: [number, number, number, number] = [0.22, 1, 0.36, 1]
// Para lo que oscila de ida y vuelta (bucles) hace falta una curva simétrica.
const curvaOscilar = 'easeInOut'

// Tres duraciones y ninguna más (en segundos).
export const duracion = { rapida: 0.18, media: 0.42, lenta: 0.7 } as const

export const transicion = {
  rapida: { duration: duracion.media / 2.3, ease: curva },
  media: { duration: duracion.media, ease: curva },
  lenta: { duration: duracion.lenta, ease: curva },
} satisfies Record<string, Transition>

// Resorte suave para lo que rebota apenas (paneles, contenido que se desbloquea).
export const resorte = { type: 'spring', stiffness: 260, damping: 28 } as const

// La ventana que se abre: duración media.
export const transicionLayout = transicion.media

// Radios en px y no en clases: Motion solo corrige la deformación del radio durante
// una animación de layout si va en `style`, y solo entiende px.
export const RADIO_OJO_DE_BUEY = 120
export const RADIO_CABECERA = 40

// Identificador de la cáscara compartida entre la burbuja de la home y la cabecera del tema.
export const idVentana = (slug: string) => `ventana-${slug}`

// ── Entradas ──────────────────────────────────────────────────────────────────
export const viewportUnaVez = { once: true, margin: '-80px' } as const

// Entrada base de toda burbuja y tarjeta.
export const emerger: Variants = {
  oculto: { opacity: 0, y: 24, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: transicion.media },
}

// Contenedor que escalona a sus hijos. El total nunca pasa de ~600ms: con muchos
// hijos se baja el paso, no se alarga la espera.
export const cascada = (paso = 0.07, retraso = 0): Variants => ({
  oculto: {},
  visible: { transition: { staggerChildren: paso, delayChildren: retraso } },
})

// Aparición corta de texto (héroe): nunca retrasa la lectura.
export const fundido: Variants = {
  oculto: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: transicion.media },
}

// Las ventanas suben como burbujas: desplazamiento horizontal mínimo y distinto en cada una.
// El escalonado sale del índice (`custom`) y no de la lista padre: dentro de AnimatePresence
// los hijos no reciben la orden `whileInView` del padre. Con índice 0 no hay demora
// (filtrar es instantáneo); el retraso total nunca pasa de 500ms.
const desvios = [-7, 5, -3, 8, -6, 3, -8, 6, -4]
export const ascender: Variants = {
  oculto: (i: number) => ({ opacity: 0, y: 32, x: desvios[i % desvios.length], scale: 0.92 }),
  visible: (i: number) => ({
    opacity: 1, y: 0, x: 0, scale: 1,
    transition: { ...transicion.media, delay: Math.min(i * 0.06, 0.5) },
  }),
  salida: { opacity: 0, scale: 0.85, pointerEvents: 'none', transition: transicion.rapida },
}

// ── Gestos ────────────────────────────────────────────────────────────────────
export const elevar: TargetAndTransition = { y: -4, transition: transicion.rapida }
export const presionar: TargetAndTransition = { scale: 0.98 }

// Variantes de una pieza clickeable: se dispara con hover, foco o toque.
export const gestos: Variants = {
  reposo: { y: 0, scale: 1 },
  enfocar: elevar,
}
// Capas que se encienden al enfocar (borde más claro, sombra más abierta): solo opacity.
export const encender: Variants = {
  reposo: { opacity: 0 },
  enfocar: { opacity: 1, transition: transicion.rapida },
}

// ── Bucles infinitos (se apagan solos en celular y con reduced motion) ───────
export const oscilar = (amplitud: number, seg: number, desfase = 0): TargetAndTransition => ({
  y: [-amplitud, amplitud],
  transition: { duration: seg, repeat: Infinity, repeatType: 'reverse', ease: curvaOscilar, delay: desfase },
})
// Objetos decorativos: y de -6 a 6, entre 6 y 9 segundos, cada uno con su desfase.
export const flotar = (desfase = 0, seg = 7): TargetAndTransition => oscilar(6, seg, desfase)

// Deriva horizontal lineal y sin fin. `distancia` = un período del dibujo, así no se nota el corte.
export const derivar = (seg: number, distancia: number): TargetAndTransition => ({
  x: [0, distancia],
  transition: { duration: seg, repeat: Infinity, repeatType: 'loop', ease: 'linear' },
})
// Olas SVG: 24 segundos; dos capas a velocidades distintas dan profundidad.
export const marea = (seg = 24, distancia = -200) => derivar(seg, distancia)

// ── Paneles, revelar y rutas ─────────────────────────────────────────────────
export const abrirPanel: Variants = {
  cerrado: { y: '-100%', opacity: 0, transition: transicion.rapida },
  abierto: { y: 0, opacity: 1, transition: { ...resorte, staggerChildren: 0.06, delayChildren: 0.08 } },
}

// Menú que se despliega desde su botón (el de la cuenta): baja unos píxeles y se asienta.
export const desplegar: Variants = {
  cerrado: { opacity: 0, y: -8, scale: 0.98, transition: transicion.rapida },
  abierto: { opacity: 1, y: 0, scale: 1, transition: transicion.media },
}

// Contenido que se abre en su lugar (bloqueado ↔ desbloqueado).
export const revelar: Variants = {
  oculto: { opacity: 0, y: 12, filter: 'blur(6px)' },
  // Al terminar se quita el filtro por completo: un blur(0px) quieto no sirve y cuesta.
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: resorte, transitionEnd: { filter: 'none' } },
  salida: { opacity: 0, filter: 'blur(8px)', transition: transicion.rapida },
}

// Cambio de página: solo opacidad. Un desplazamiento en el contenedor de la página
// falsearía la medición de la cáscara compartida.
export const transicionDeRuta = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: transicion.media,
}

// ── Preferencias de la persona ───────────────────────────────────────────────
// Con prefers-reduced-motion, MotionConfig (en main.tsx) apaga transform y layout y deja
// solo el fundido. Acá se apagan además los bucles y las decoraciones grandes.
export function useMovimiento() {
  const reducido = useReducedMotion() ?? false
  const escritorio = useMediaQuery('(min-width: 768px)')
  return {
    reducido,
    escritorio,
    // Bucles infinitos: solo en escritorio y sin reduced motion.
    bucles: escritorio && !reducido,
    // Objetos decorativos grandes: no se cargan en celular.
    decoracionGrande: escritorio,
  }
}
