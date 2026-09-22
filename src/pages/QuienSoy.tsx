import { useSesion } from '../auth/SesionContext'
import Burbuja from '../componentes/base/Burbuja'
import Esqueleto from '../componentes/base/Esqueleto'
import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import EstadoVacio from '../componentes/base/EstadoVacio'
import Pagina from '../componentes/layout/Pagina'
import { obtenerQuienSoy } from '../datos/contenido'
import { useCarga } from '../lib/useCarga'

// La sesión no cambia qué se ve acá salvo para la propia admin (que puede estar previendo un
// borrador, igual que en /tema/:slug): por eso la clave lleva el rol y no es "pública".
export default function QuienSoy() {
  const { rol } = useSesion()
  const { datos, cargando, error, reintentar } = useCarga(`quien-soy:${rol}`, obtenerQuienSoy)

  if (error) {
    return (
      <Pagina ancho="lectura">
        <ErrorDeCarga texto="No pudimos cargar esta página." onReintentar={reintentar} />
      </Pagina>
    )
  }

  if (cargando) {
    return (
      <Pagina ancho="lectura">
        <div role="status">
          <p className="sr-only">Cargando…</p>
          <Esqueleto className="h-64" />
        </div>
      </Pagina>
    )
  }

  // Sin error y sin datos es una respuesta real: oculta (`publicado` en falso) o todavía sin cargar
  // nada, no una falla — por eso no pasa por ErrorDeCarga.
  if (!datos) {
    return (
      <Pagina ancho="lectura">
        <Burbuja tono="aguaClara" entrada="ninguna">
          <EstadoVacio titulo="Todavía no hay nada acá" texto="Esta página está vacía por ahora." enlace={{ to: '/', texto: 'Volver al inicio' }} />
        </Burbuja>
      </Pagina>
    )
  }

  return (
    <Pagina ancho="lectura">
      <Burbuja tono="blanco" entrada="ninguna" interior="flex flex-col gap-6">
        {datos.fotoUrl && (
          <img src={datos.fotoUrl} alt={datos.nombre ? `Foto de ${datos.nombre}` : 'Foto'} className="size-32 rounded-full border border-mar-bordeAgua object-cover" />
        )}
        <div>
          <h1 className="mb-2 text-titulo-m font-light md:text-titulo-l">{datos.nombre || 'Quién soy'}</h1>
          {datos.descripcion && <p className="max-w-parrafo whitespace-pre-line text-cuerpo text-mar-tintaSuave">{datos.descripcion}</p>}
        </div>

        {datos.campos.length > 0 && (
          <dl className="flex flex-col gap-3">
            {datos.campos.map((c) => (
              <div key={c.etiqueta} className="flex flex-col gap-1 border-b border-mar-bordeAgua pb-3 last:border-0 last:pb-0 md:flex-row md:gap-3">
                <dt className="w-48 shrink-0 font-medium text-mar-tinta">{c.etiqueta}</dt>
                <dd className="text-mar-tintaSuave">{c.valor}</dd>
              </div>
            ))}
          </dl>
        )}
      </Burbuja>
    </Pagina>
  )
}
