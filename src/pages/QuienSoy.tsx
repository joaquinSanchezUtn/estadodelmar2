import { useSesion } from '../auth/SesionContext'
import Boton from '../componentes/base/Boton'
import Burbuja from '../componentes/base/Burbuja'
import Esqueleto from '../componentes/base/Esqueleto'
import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import EstadoVacio from '../componentes/base/EstadoVacio'
import Pagina from '../componentes/layout/Pagina'
import { obtenerQuienSoy } from '../datos/contenido'
import { useCarga } from '../lib/useCarga'

// La sesión no cambia qué se ve acá salvo para la propia admin (que puede estar previendo un
// borrador, igual que en /tema/:slug): por eso la clave lleva el rol y no es "pública".
// Todo lo que se muestra lo cargó la dueña en /admin/quien-soy: nada inventado.
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
      <Pagina ancho="ancho">
        <div role="status">
          <p className="sr-only">Cargando…</p>
          <Esqueleto className="h-80" />
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

  const iniciales = (datos.nombre || 'Quién soy').split(' ').map((p) => p[0]).slice(0, 2).join('')

  return (
    <Pagina ancho="ancho">
      <header className="grid items-center gap-6 rounded-burbujaGrande border border-mar-bordeAgua bg-gradient-to-br from-mar-arena via-mar-nube to-mar-aguaClara p-6 shadow-suave md:grid-cols-[auto_minmax(0,1fr)] md:gap-10 md:p-12">
        {datos.fotoUrl ? (
          <img
            src={datos.fotoUrl}
            alt={datos.nombre ? `Foto de ${datos.nombre}` : 'Foto'}
            className="size-40 rounded-burbujaGrande border-3 border-mar-blanco object-cover shadow-alzada md:size-56"
          />
        ) : (
          <span aria-hidden="true" className="flex size-40 items-center justify-center rounded-burbujaGrande border-3 border-mar-blanco bg-mar-primarioSuave font-titulo text-titulo-xl text-mar-primario shadow-alzada md:size-56">
            {iniciales}
          </span>
        )}
        <div className="flex flex-col items-start gap-4">
          <p className="text-etiqueta uppercase text-mar-atardecerTexto">Quién te acompaña</p>
          <h1 className="text-titulo-l md:text-titulo-xl">{datos.nombre || 'Quién soy'}</h1>
          {datos.campos.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {datos.campos.slice(0, 2).map((c) => (
                <li key={c.etiqueta} className="rounded-full bg-mar-blanco px-4 py-2 text-meta font-bold text-mar-primario shadow-suave">
                  {c.valor}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        {datos.descripcion && (
          <section className="rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-6 shadow-suave md:p-10">
            <h2 className="mb-4 text-titulo-m">Sobre mí</h2>
            <p className="max-w-parrafo whitespace-pre-line text-destacado text-mar-tintaSuave">{datos.descripcion}</p>
          </section>
        )}

        {datos.campos.length > 0 && (
          <section className="rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-6 shadow-suave">
            <h2 className="mb-4 text-titulo-s">En pocas palabras</h2>
            <dl className="flex flex-col gap-4">
              {datos.campos.map((c) => (
                <div key={c.etiqueta} className="border-l-3 border-mar-atardecer pl-4">
                  <dt className="text-etiqueta uppercase text-mar-tintaSuave">{c.etiqueta}</dt>
                  <dd className="mt-1 text-cuerpo font-medium text-mar-tinta">{c.valor}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>

      <section className="flex flex-col items-center gap-4 rounded-burbujaGrande bg-mar-primarioSuave p-6 text-center md:p-10">
        <h2 className="text-titulo-m">¿Por dónde empezar?</h2>
        <p className="max-w-parrafo text-destacado text-mar-tintaSuave">
          Fijate cómo está tu mar hoy y elegí desde ahí. Si tenés una pregunta, escribime.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Boton to="/#estados">Ver cómo estoy hoy</Boton>
          <Boton to="/contacto" variante="secundario">
            Escribime
          </Boton>
        </div>
      </section>
    </Pagina>
  )
}
