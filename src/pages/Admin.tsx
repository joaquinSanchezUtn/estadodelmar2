import { useState } from 'react'
import { useSesion } from '../auth/SesionContext'
import Esqueleto from '../componentes/base/Esqueleto'
import EditorVentana from '../componentes/admin/EditorVentana'
import ListadoVentanas from '../componentes/admin/ListadoVentanas'
import Seccion from '../componentes/layout/Seccion'
import { listarEstados, listarTemasAdmin } from '../datos/contenido'
import { useCarga } from '../lib/useCarga'

export default function Admin() {
  const { rol } = useSesion()
  const { datos, cargando } = useCarga(`admin:${rol}`, async () => {
    const [temas, estados] = await Promise.all([listarTemasAdmin(), listarEstados()])
    return { temas, estados }
  })
  const [elegido, setElegido] = useState<string | null>(null)

  // En celular la lista y el editor van apilados: al elegir, se baja al editor.
  const elegir = (slug: string) => {
    setElegido(slug)
    if (!window.matchMedia('(min-width: 1024px)').matches) {
      document.getElementById('editor')?.scrollIntoView()
    }
  }

  const actual = datos?.temas.find((t) => t.slug === elegido) ?? datos?.temas[0]

  return (
    <Seccion fondo="agua">
      <h1 className="mb-6 text-3xl font-light md:text-4xl">Panel de administración</h1>

      {cargando || !datos ? (
        <div role="status" className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <p className="sr-only">Cargando las ventanas…</p>
          <Esqueleto className="h-72" />
          <Esqueleto className="h-96" />
        </div>
      ) : !actual ? (
        <p className="text-base text-mar-tintaSuave">No hay ventanas para mostrar.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start lg:gap-8">
          <ListadoVentanas
            temas={datos.temas}
            estados={datos.estados}
            seleccionado={actual.slug}
            onElegir={elegir}
          />
          <div id="editor">
            <EditorVentana key={actual.slug} tema={actual} estados={datos.estados} />
          </div>
        </div>
      )}
    </Seccion>
  )
}
