import type { EstadoMar } from '../../datos/tipos'
import { cn } from '../../lib/cn'
import { urlDeEstado } from '../../lib/estados'
import Tarjeta from '../base/Tarjeta'
import ImagenDeVentana from '../objetos/ImagenDeVentana'
import { coloresEstado } from '../objetos/estados/colores'

type Props = { estado: EstadoMar; cantidad: number | null }

// La puerta de entrada al sitio: una ventana con su foto (o el dibujo de su aspecto), qué se vive ahí, la
// enseñanza y cuántos temas hay. Es un enlace real a la página de la ventana.
// Proporción pedida por Joaquin (2026-10-03): 40 % imagen, 60 % texto. Las filas `2fr`/`3fr` sostienen esa
// relación: el alto lo da el texto (la tarjeta más larga de la fila manda) y la imagen se adapta.
export default function TarjetaEstado({ estado, cantidad }: Props) {
  const c = coloresEstado[estado.estilo]

  return (
    <Tarjeta to={urlDeEstado(estado.id)} className={cn('grid h-full grid-rows-[2fr_3fr] overflow-hidden p-0 shadow-suave', c.fondo, c.borde)}>
      {/* La imagen va absoluta: no aporta alto propio, así el texto fija el alto y la imagen ocupa 2/3 de eso. */}
      <span aria-hidden="true" className={cn('relative block overflow-hidden', c.agua)}>
        <span className="absolute inset-0">
          <ImagenDeVentana estado={estado} />
        </span>
      </span>
      <span className="flex flex-col gap-2 p-4 sm:p-5">
        <span className="font-titulo text-destacado text-mar-tinta sm:text-titulo-s">{estado.nombre}</span>
        <span className="text-meta text-mar-tintaSuave">{estado.estadoInterno}.</span>
        {/* La enseñanza, solo con lugar: en el celular la tarjeta va de a dos y queda en la página de la ventana. */}
        <span className="hidden font-titulo text-meta italic text-mar-tintaTenue sm:block">{estado.ensenanza}.</span>
        <span className="mt-auto pt-2 text-meta font-bold text-mar-tinta">
          {cantidad === null ? 'Ver temas' : cantidad === 0 ? 'Próximamente' : `${cantidad} ${cantidad === 1 ? 'tema' : 'temas'}`} →
        </span>
      </span>
    </Tarjeta>
  )
}
