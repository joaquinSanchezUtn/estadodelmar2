import type { ComponentProps } from 'react'
import type { EstadoMar } from '../../datos/tipos'
import DibujoEstado from './DibujoEstado'

type Props = { estado: EstadoMar | null } & Omit<ComponentProps<typeof DibujoEstado>, 'estado'>

// Lo que se ve "por la ventana": la foto que subió la dueña o, si no hay, el dibujo animado de su aspecto.
// Decorativa: el nombre de la ventana ya está escrito al lado.
export default function ImagenDeVentana({ estado, ...dibujo }: Props) {
  if (estado?.fotoUrl) return <img src={estado.fotoUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
  return <DibujoEstado estado={estado?.estilo ?? null} {...dibujo} />
}
