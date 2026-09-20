import type { ComponentProps, ReactNode } from 'react'
import Sello from '../base/Sello'
import Tarjeta from '../base/Tarjeta'

type Props = { sello: { tono: ComponentProps<typeof Sello>['tono']; texto: string }; children: ReactNode }

// El marco común de la sección Suscripción: título y una etiqueta con el estado.
export default function TarjetaSuscripcion({ sello, children }: Props) {
  return (
    <Tarjeta className="p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-titulo-s font-normal">Suscripción</h2>
        <Sello tono={sello.tono}>{sello.texto}</Sello>
      </div>
      {children}
    </Tarjeta>
  )
}
