import type { EstadoMar } from '../../datos/tipos'
import Tarjeta from '../base/Tarjeta'
import DibujoEstado from '../objetos/DibujoEstado'

type Props = { estado: EstadoMar; activo: boolean }

// Enlace real: filtra las ventanas por estado. Tocar el activo quita el filtro.
export default function TarjetaEstado({ estado, activo }: Props) {
  return (
    <Tarjeta
      to={activo ? '/#ventanas' : `/?estado=${estado.id}#ventanas`}
      activa={activo}
      tono="aguaClara"
      className="flex h-full flex-col gap-3 p-4 md:p-5"
    >
      <span className="relative block h-24 overflow-hidden rounded-2xl bg-mar-blanco/70">
        <DibujoEstado estado={estado.id} className="text-mar-agua" />
      </span>
      <span className="font-titulo text-lg text-mar-tinta md:text-xl">{estado.nombre}</span>
      <span className="text-sm leading-relaxed text-mar-tintaSuave">{estado.estadoInterno}.</span>
    </Tarjeta>
  )
}
