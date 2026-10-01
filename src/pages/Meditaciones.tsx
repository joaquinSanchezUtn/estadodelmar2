import Pagina from '../componentes/layout/Pagina'
import GrillaDeVentanas from '../componentes/ventana/GrillaDeVentanas'
import { listarEstados, listarTemas } from '../datos/contenido'
import { useCarga } from '../lib/useCarga'

// La ventana de meditaciones: reúne los temas que tienen una meditación publicada. Cada uno lleva a su tema,
// donde la meditación se abre o queda bloqueada según el acceso (lo decide la base, no esta página). La
// cabecera es la franja nocturna de la home: la noche invita a bajar el ritmo.
export default function Meditaciones() {
  const { datos: estados } = useCarga('estados', listarEstados, true)
  const { datos: temas } = useCarga('temas', listarTemas, true)
  const conMeditacion = temas ? temas.filter((t) => t.piezas.some((p) => p.tipo === 'meditacion')) : null

  return (
    <Pagina ancho="ancho">
      <header className="mt-2 rounded-burbujaGrande bg-gradient-to-b from-mar-noche to-mar-nocheProfunda px-6 py-10 text-mar-sobreNoche md:px-10 md:py-16">
        <p className="mb-3 text-etiqueta uppercase text-mar-sobreNocheSuave">Una ventana propia</p>
        <h1 className="mb-4 text-titulo-l text-mar-sobreNoche md:text-titulo-xl">Meditaciones</h1>
        <p className="max-w-parrafo text-destacado text-mar-sobreNocheSuave">
          Todas las meditaciones guiadas, reunidas en un solo lugar. Para volver a la profundidad cuando la superficie está agitada, o
          para quedarse un rato ahí aunque esté en calma.
        </p>
      </header>

      <section className="flex flex-col gap-6 py-4">
        <h2 className="text-titulo-m md:text-titulo-l">Elegí por dónde entrar</h2>
        {conMeditacion?.length === 0 ? (
          <p className="rounded-burbuja border border-dashed border-mar-bordeAgua bg-mar-blanco/60 p-5 text-cuerpo text-mar-tintaSuave">
            Todavía no hay meditaciones publicadas. Se van sumando con cada tema.
          </p>
        ) : (
          <GrillaDeVentanas temas={conMeditacion} estados={estados} />
        )}
      </section>
    </Pagina>
  )
}
