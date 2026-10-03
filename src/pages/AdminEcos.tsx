import { useState } from 'react'
import AgregarEcos from '../componentes/admin/AgregarEcos'
import FilaEco from '../componentes/admin/FilaEco'
import MarcoAdmin from '../componentes/admin/MarcoAdmin'
import Boton from '../componentes/base/Boton'
import Campo from '../componentes/base/Campo'
import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import Esqueleto from '../componentes/base/Esqueleto'
import { listarEcosAdmin } from '../datos/ecos'
import { useCarga } from '../lib/useCarga'

const migas = [{ texto: 'Panel', to: '/admin' }, { texto: 'Ecos del océano' }]
const DE_A = 50

// Los ecos del océano: uno por día en la pestaña del costado. Del más nuevo al más viejo, con buscador
// (son cientos) y de a 50 para que la pantalla no pese.
export default function AdminEcos() {
  const { datos, cargando, error, reintentar } = useCarga('admin:ecos', listarEcosAdmin)
  const [busqueda, setBusqueda] = useState('')
  const [visibles, setVisibles] = useState(DE_A)
  const termino = busqueda.trim().toLocaleLowerCase('es')
  const filtrados = datos?.filter((e) => e.texto.toLocaleLowerCase('es').includes(termino)) ?? []
  const enRotacion = datos?.filter((e) => e.publicado).length ?? 0

  return (
    <MarcoAdmin titulo="Ecos del océano" migas={migas}>
      <div className="flex flex-col gap-6">
        <p className="max-w-parrafo text-cuerpo text-mar-tintaSuave">
          Cada día el sitio muestra uno, sin repetir hasta pasar por todos. Los ocultos no salen en la rotación, pero no se pierden.
        </p>
        <AgregarEcos onAgregados={reintentar} />

        {error ? (
          <ErrorDeCarga texto="No pudimos leer los ecos." onReintentar={reintentar} />
        ) : cargando || !datos ? (
          <div role="status">
            <p className="sr-only">Cargando…</p>
            <Esqueleto className="h-40" />
          </div>
        ) : (
          <section aria-labelledby="titulo-lista-ecos" className="flex flex-col gap-4">
            <h2 id="titulo-lista-ecos" className="text-titulo-s font-normal">
              Todos los ecos
            </h2>
            <p role="status" className="text-cuerpo text-mar-tintaSuave">
              {datos.length} en total · {enRotacion} en la rotación
            </p>
            <Campo
              etiqueta="Buscar"
              type="search"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setVisibles(DE_A)
              }}
            />
            {filtrados.length === 0 ? (
              <p className="text-cuerpo text-mar-tintaSuave">Ningún eco coincide con la búsqueda.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {filtrados.slice(0, visibles).map((e) => (
                  <FilaEco key={`${e.id}:${e.texto}:${e.publicado}`} eco={e} onCambio={reintentar} />
                ))}
              </ul>
            )}
            {filtrados.length > visibles && (
              <div>
                <Boton variante="secundario" onClick={() => setVisibles((v) => v + DE_A)}>
                  Ver más ({filtrados.length - visibles} restantes)
                </Boton>
              </div>
            )}
          </section>
        )}
      </div>
    </MarcoAdmin>
  )
}
