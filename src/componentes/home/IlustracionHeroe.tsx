import { motion } from 'motion/react'
import { oscilar, useMovimiento } from '../../animaciones/movimiento'

// La ilustración del héroe: el mar al atardecer. Es decorativa (aria-hidden) salvo la tarjeta de abajo,
// que cuenta en una línea qué trae cada tema. Los colores del cielo son propios de la ilustración: no son
// tokens de interfaz (nunca van detrás de un texto).
const cielo = ['#FFD9C2', '#FFE9D6', '#CFE6F5', '#7FB5DB', '#2F6FB2']
const olas = [
  { d: 'M0 90 C90 60 170 110 250 90 C340 66 420 108 500 88 V260 H0Z', color: '#8FC0E2' },
  { d: 'M0 140 C110 112 190 160 280 140 C370 120 430 150 500 138 V260 H0Z', color: '#4F90C9' },
  { d: 'M0 190 C120 170 210 205 300 190 C390 176 450 198 500 190 V260 H0Z', color: '#2F6FB2' },
]

export default function IlustracionHeroe() {
  const { bucles } = useMovimiento()

  return (
    <div className="relative aspect-square overflow-hidden rounded-burbujaGrande shadow-ilustracion">
      <svg aria-hidden="true" viewBox="0 0 500 500" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="cielo-heroe" x1="0" y1="0" x2="0" y2="1">
            {cielo.map((c, i) => (
              <stop key={c} offset={`${(i / (cielo.length - 1)) * 100}%`} stopColor={c} />
            ))}
          </linearGradient>
          <radialGradient id="sol-heroe">
            <stop offset="0%" stopColor="#FFF4E6" />
            <stop offset="100%" stopColor="#FFB38F" />
          </radialGradient>
        </defs>
        <rect width="500" height="500" fill="url(#cielo-heroe)" />
        <circle cx="250" cy="190" r="62" fill="url(#sol-heroe)" opacity="0.95" />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 500 260" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-1/2 w-full">
        {olas.map((o, i) => (
          <motion.path
            key={o.d}
            d={o.d}
            fill={o.color}
            animate={bucles ? oscilar(3, 7 + i, i * 0.6) : undefined}
          />
        ))}
      </svg>
      <div className="absolute inset-x-5 bottom-5 flex items-center gap-4 rounded-burbuja bg-mar-blanco/90 p-4 shadow-suave">
        <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-mar-primario">
          <span className="ml-1 border-y-8 border-l-8 border-y-transparent border-l-mar-sobrePrimario" />
        </span>
        <p className="text-meta text-mar-tintaSuave">
          <span className="block text-cuerpo font-bold text-mar-tinta">Un video, una meditación y una ejercitación</span>
          en cada tema, para escuchar donde estés.
        </p>
      </div>
    </div>
  )
}
