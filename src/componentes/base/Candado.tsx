import { IconoCandado } from './iconos'

type Props = { etiqueta?: string; className?: string }

// Marca de contenido bloqueado, con texto para lectores de pantalla.
export default function Candado({ etiqueta = 'Contenido bloqueado', className }: Props) {
  return (
    <span role="img" aria-label={etiqueta} className="inline-flex">
      <IconoCandado className={className} />
    </span>
  )
}
