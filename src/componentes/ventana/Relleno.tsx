import type { EstadoMarId } from '../../datos/tipos'
import { cn } from '../../lib/cn'
import { coloresDe } from '../objetos/estados/colores'

// Ola rellena: un borde ondulado que sigue hasta el fondo del círculo.
function ola(y: number, alto: number) {
  let d = `M0 ${y} q6.25 ${-alto} 12.5 0`
  for (let x = 12.5; x < 100; x += 12.5) d += ' t12.5 0'
  return d + ' V100 H0Z'
}

// El agua de un ojo de buey: el cielo con degradé y dos capas de ola rellenas, más altas cuanto más
// movido está el mar del estado. Es decoración pura: nunca lleva contenido. Va debajo del dibujo de línea.
export default function Relleno({ estado }: { estado: EstadoMarId | null }) {
  const c = coloresDe(estado)

  return (
    <>
      <span aria-hidden="true" className={cn('absolute inset-0', c.cielo)} />
      <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d={ola(50, c.agitacion)} className={c.olaTrasera} />
        <path d={ola(64, c.agitacion * 1.3)} className={c.olaDelantera} />
      </svg>
    </>
  )
}
