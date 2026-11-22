import { motion, useReducedMotion } from 'motion/react'
import { correr, girar, mecer, respirar } from '../../animaciones/movimiento'
import { cn } from '../../lib/cn'

type Props = { tamano?: 'chico' | 'grande'; className?: string }

// Medidas proporcionales al dibujo (no a la escala de la página): así el mismo dibujo sirve grande y chico.
const pantalla = 'flex min-h-[70vh] items-center justify-center' // escala-ok: ocupa el alto de la pantalla para quedar centrada
const hueco = 'absolute inset-[14%] overflow-hidden rounded-full' // escala-ok: el cielo llena el hueco de la ola
const sol = 'absolute bottom-[30%] right-[18%] size-[22%] rounded-full' // escala-ok: proporcional al dibujo
const mar = 'absolute bottom-0 left-0 h-[34%] w-[200%]' // escala-ok: mide dos veces el ancho y se corre la mitad, para el bucle
const capa = 'absolute inset-0 h-full w-full'

// Los colores salen de la paleta (`tailwind.config.js`): del azul océano (`primario`, `tituloClaro`) al verde de
// «Olas suaves» (`estado.olasSuaves.aro`), pasando por el turquesa de «Mar en calma» (`estado.calma.aro`).
const AZUL = '#1A62A0'
const CELESTE = '#3E8CCB'
const TURQUESA = '#2A7D7E'
const VERDE = '#296A49'
const VERDE_CLARO = '#5E9F78'

// La forma de la ola, calculada una vez: una media luna que da casi toda la vuelta, finita en la cola y gruesa en
// la cresta (arriba), que termina redondeada. El ancho crece de a poco (no en escalones).
const punto = (r: number, grados: number) => {
  const a = (grados * Math.PI) / 180
  return [50 + r * Math.cos(a), 50 + r * Math.sin(a)] as const
}
const R = 46
const CRESTA = -90 // arriba
const VUELTA = 285 // cuántos grados ocupa la ola
const ancho = (t: number) => 0.8 + 8.2 * t ** 1.6 // t: 0 en la cola, 1 en la cresta
const PASOS = 48
const angulo = (t: number) => CRESTA - VUELTA * (1 - t)
const afuera = Array.from({ length: PASOS + 1 }, (_, k) => punto(R, angulo(k / PASOS)))
const adentro = Array.from({ length: PASOS + 1 }, (_, k) => punto(R - ancho(k / PASOS), angulo(k / PASOS))).reverse()
const punta = punto(R - ancho(1) / 2 + 1.5, CRESTA + 9)
const xy = (p: readonly [number, number]) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`
const FORMA_DE_OLA = `M ${afuera.map(xy).join(' L ')} Q ${xy(punta)} ${xy(adentro[0])} L ${adentro.map(xy).join(' L ')} Z`
const ESPUMA = `M ${Array.from({ length: 13 }, (_, k) => xy(punto(R - ancho(0.78 + k * 0.017) + 1.4, angulo(0.72 + k * 0.022)))).join(' L ')}`
const GOTAS = [punto(R + 1.5, CRESTA + 14), punto(R - 2, CRESTA + 18), punto(R + 3, CRESTA + 21)]

// La ola que rodea al dibujo: la media luna en degradé (la cresta azul, la cola verde), con espuma y gotitas. Gira
// entera, así parece que rompe y vuelve a empezar.
function Ola({ quieta }: { quieta: boolean }) {
  return (
    <motion.svg viewBox="0 0 100 100" className={capa} animate={quieta ? undefined : girar(5)}>
      <defs>
        <linearGradient id="carga-ola" gradientUnits="userSpaceOnUse" x1="70" y1="0" x2="20" y2="100">
          <stop offset="0" stopColor={AZUL} />
          <stop offset="0.45" stopColor={CELESTE} />
          <stop offset="0.75" stopColor={TURQUESA} />
          <stop offset="1" stopColor={VERDE_CLARO} />
        </linearGradient>
      </defs>
      <path d={FORMA_DE_OLA} fill="url(#carga-ola)" />
      {/* Espuma: una línea blanca por dentro de la cresta y unas gotitas que saltan adelante. */}
      <path d={ESPUMA} fill="none" stroke="white" strokeOpacity="0.9" strokeWidth="1.1" strokeLinecap="round" />
      <circle cx={GOTAS[0][0]} cy={GOTAS[0][1]} r="1.1" fill={CELESTE} />
      <circle cx={GOTAS[1][0]} cy={GOTAS[1][1]} r="0.8" fill={CELESTE} fillOpacity="0.8" />
      <circle cx={GOTAS[2][0]} cy={GOTAS[2][1]} r="0.6" fill={CELESTE} fillOpacity="0.6" />
    </motion.svg>
  )
}

// El brote del centro: un tallo azul que termina en dos rulos, dos hojas verdes y la tablita donde se apoya. Se
// mece desde la base, como una planta en el agua.
function Brote({ quieto }: { quieto: boolean }) {
  return (
    <motion.svg viewBox="0 0 100 100" className={capa} style={{ originX: '50%', originY: '80%' }} animate={quieto ? undefined : mecer(3.2)}>
      <g transform="translate(50 80) scale(1.3) translate(-50 -80)">
      <path d="M41 81 Q 51 78.5 62 82" fill="none" stroke={AZUL} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M50.5 80 C 49 70, 54 60, 50 47" fill="none" stroke={AZUL} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M50 47 C 48 39.5, 41.5 37.5, 38.5 42" fill="none" stroke={CELESTE} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M51 51 C 53.5 44, 59 43, 61 46.5" fill="none" stroke={CELESTE} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M50 69 C 42 69, 37 63.5, 37 57.5 C 44.5 57.5, 49.5 62, 50 69 Z" fill={VERDE} />
      <path d="M51.5 62.5 C 59.5 62.5, 64 57, 64 51 C 56.5 51, 52 55.5, 51.5 62.5 Z" fill={VERDE_CLARO} />
      </g>
    </motion.svg>
  )
}

// Lo que se ve mientras algo carga (pedido de Joaquin, 2026-11-22: «basate en el emblema del logo, pero armalo
// desde cero»): un dibujo propio inspirado en el emblema de Marea Interior. Adentro de un círculo, un cielo de
// atardecer con su sol y el mar que corre abajo; alrededor, la ola que gira; al centro, el brote que se mece. El
// grande va centrado en el alto de la pantalla. Con `prefers-reduced-motion`, quieto. El texto para lectores de
// pantalla va oculto.
export default function CargaDeOlas({ tamano = 'grande', className }: Props) {
  const quieto = !!useReducedMotion()
  const grande = tamano === 'grande'

  const dibujo = (
    <motion.span aria-hidden="true" className={cn('relative block', grande ? 'size-32' : 'size-6')} animate={quieto || !grande ? undefined : respirar(3)}>
      <span className={cn(hueco, 'bg-gradient-to-br from-mar-aguaClara via-mar-nube to-mar-arena')}>
        <span className={cn(sol, 'bg-mar-atardecer/25')} />
        <motion.svg viewBox="0 0 200 40" preserveAspectRatio="none" className={mar} animate={quieto ? undefined : correr(3.5)}>
          <path d="M0 10 Q 25 4 50 10 T 100 10 T 150 10 T 200 10 V 40 H 0 Z" className="fill-mar-celeste" />
          <path d="M0 18 Q 25 13 50 18 T 100 18 T 150 18 T 200 18 V 40 H 0 Z" className="fill-mar-primario" fillOpacity="0.55" />
        </motion.svg>
      </span>
      <Ola quieta={quieto} />
      <Brote quieto={quieto} />
    </motion.span>
  )

  return (
    <span role="status" className={cn(grande ? pantalla : 'inline-flex items-center', className)}>
      <span className="sr-only">Cargando…</span>
      {dibujo}
    </span>
  )
}
