import Burbuja from '../componentes/base/Burbuja'
import Olas from '../componentes/objetos/Olas'
import Pagina from '../componentes/layout/Pagina'
import GrillaDeVentanas from '../componentes/ventana/GrillaDeVentanas'
import { listarEstados, listarTemas } from '../datos/contenido'
import { useCarga } from '../lib/useCarga'

// La ventana de meditaciones: reúne las ventanas que tienen una meditación publicada. Cada una lleva a
// su tema, donde la meditación se abre o queda bloqueada según el acceso (lo decide la base, no esta página).
export default function Meditaciones() {
  const { datos: estados } = useCarga('estados', listarEstados, true)
  const { datos: temas } = useCarga('temas', listarTemas, true)
  const conMeditacion = temas ? temas.filter((t) => t.piezas.some((p) => p.tipo === 'meditacion')) : null

  return (
    <Pagina ancho="ancho">
      <Burbuja tono="aguaClara" entrada="ninguna" className="pb-20 md:pb-24" decoracion={<Olas />}>
        <p className="mb-3 text-etiqueta uppercase text-mar-atardecerTexto">Una ventana propia</p>
        <h1 className="mb-4 text-titulo-l font-light md:text-titulo-xl">Meditaciones</h1>
        <p className="max-w-parrafo text-destacado text-mar-tintaSuave">
          Todas las meditaciones guiadas, reunidas en un solo lugar. Para volver a la profundidad cuando la superficie está agitada, o
          para quedarse un rato ahí aunque esté en calma.
        </p>
      </Burbuja>

      <Burbuja tono="blanco" entrada="ninguna" interior="flex flex-col gap-6">
        <h2 className="text-titulo-m font-light md:text-titulo-l">Elegí por dónde entrar</h2>
        {conMeditacion?.length === 0 ? (
          <p className="rounded-burbuja border border-dashed border-mar-bordeAgua bg-mar-blanco/60 p-5 text-cuerpo text-mar-tintaSuave">
            Todavía no hay meditaciones publicadas. Se van sumando con el tiempo.
          </p>
        ) : (
          <GrillaDeVentanas temas={conMeditacion} estados={estados} />
        )}
      </Burbuja>
    </Pagina>
  )
}
