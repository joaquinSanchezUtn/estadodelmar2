import { useState } from 'react'
import AgregarFrases from '../componentes/admin/AgregarFrases'
import FilaFrase from '../componentes/admin/FilaFrase'
import MarcoAdmin from '../componentes/admin/MarcoAdmin'
import Boton from '../componentes/base/Boton'
import Campo from '../componentes/base/Campo'
import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import Esqueleto from '../componentes/base/Esqueleto'
import { listarFrasesAdmin } from '../datos/frases'
import { g, SECCIONES_DE_FRASES, type SeccionDeFrases } from '../datos/seccionesDeFrases'
import { useCarga } from '../lib/useCarga'

const DE_A = 50

// Las frases de una sección (Semillas del mar o Ecos del océano): una por día en su pestaña del costado.
// De la más nueva a la más vieja, con buscador (pueden ser cientos) y de a 50 para que la pantalla no pese.
// Las dos rutas la montan con `key` distinta: sin eso, React reusaría el estado (la búsqueda) al pasar de una a otra.
export default function AdminFrases({ seccion }: { seccion: SeccionDeFrases }) {
  const c = SECCIONES_DE_FRASES[seccion]
  const { datos, cargando, error, reintentar } = useCarga(`admin:frases:${seccion}`, () => listarFrasesAdmin(seccion))
  const [busqueda, setBusqueda] = useState('')
  const [visibles, setVisibles] = useState(DE_A)
  const termino = busqueda.trim().toLocaleLowerCase('es')
  const filtradas = datos?.filter((f) => f.texto.toLocaleLowerCase('es').includes(termino)) ?? []
  const enRotacion = datos?.filter((f) => f.publicado).length ?? 0

  return (
    <MarcoAdmin titulo={c.titulo} migas={[{ texto: 'Panel', to: '/admin' }, { texto: c.titulo }]}>
      <div className="flex flex-col gap-6">
        <p className="max-w-parrafo text-cuerpo text-mar-tintaSuave">
          Cada día el sitio muestra {g(c, 'una', 'uno')} en la pestaña del costado {c.lado}, sin repetir hasta pasar por {g(c, 'todas', 'todos')}.{' '}
          {g(c, 'Las ocultas no salen', 'Los ocultos no salen')} en la rotación, pero no se pierden. Si no hay {g(c, 'ninguna publicada', 'ninguno publicado')}, la pestaña no aparece.
        </p>
        <AgregarFrases seccion={seccion} onAgregadas={reintentar} />

        {error ? (
          <ErrorDeCarga texto={`No pudimos leer ${g(c, 'las', 'los')} ${c.plural}.`} onReintentar={reintentar} />
        ) : cargando || !datos ? (
          <div role="status">
            <p className="sr-only">Cargando…</p>
            <Esqueleto className="h-40" />
          </div>
        ) : datos.length === 0 ? (
          <p className="rounded-tarjeta border border-dashed border-mar-bordeAgua bg-mar-blanco/60 p-5 text-cuerpo text-mar-tintaSuave">
            Todavía no hay {c.plural}. {g(c, 'Las', 'Los')} que sumes arriba van a aparecer acá.
          </p>
        ) : (
          <section aria-labelledby={`titulo-lista-${seccion}`} className="flex flex-col gap-4">
            <h2 id={`titulo-lista-${seccion}`} className="text-titulo-s font-normal">
              {g(c, 'Todas las', 'Todos los')} {c.plural}
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
            {filtradas.length === 0 ? (
              <p className="text-cuerpo text-mar-tintaSuave">
                {g(c, 'Ninguna', 'Ningún')} {c.singular} coincide con la búsqueda.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {filtradas.slice(0, visibles).map((f) => (
                  <FilaFrase key={`${f.id}:${f.texto}:${f.publicado}`} seccion={seccion} frase={f} onCambio={reintentar} />
                ))}
              </ul>
            )}
            {filtradas.length > visibles && (
              <div>
                <Boton variante="secundario" onClick={() => setVisibles((v) => v + DE_A)}>
                  Ver más ({filtradas.length - visibles} restantes)
                </Boton>
              </div>
            )}
          </section>
        )}
      </div>
    </MarcoAdmin>
  )
}
