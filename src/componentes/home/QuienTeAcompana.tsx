import { useSesion } from '../../auth/SesionContext'
import { obtenerQuienSoy } from '../../datos/contenido'
import { useCarga } from '../../lib/useCarga'
import Boton from '../base/Boton'
import Seccion from './Seccion'

// Quién está detrás: lo que más confianza da. Todo sale de "Quién soy" (lo carga la dueña desde el
// panel); si no está publicado —o todavía no tiene nombre—, la sección no aparece. Nunca un dato inventado.
export default function QuienTeAcompana() {
  const { rol } = useSesion()
  const { datos } = useCarga(`quien-soy:${rol}`, obtenerQuienSoy)
  if (!datos?.publicado || !datos.nombre) return null
  const iniciales = datos.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('')

  return (
    <Seccion id="quien" titulo="Quién te acompaña">
      <div className="grid items-center gap-6 rounded-burbujaGrande border border-mar-bordeAgua bg-mar-blanco p-6 shadow-suave md:grid-cols-[auto_1fr] md:gap-10 md:p-10">
        {datos.fotoUrl ? (
          <img src={datos.fotoUrl} alt={`Foto de ${datos.nombre}`} className="size-40 rounded-burbuja object-cover md:size-48" />
        ) : (
          <span aria-hidden="true" className="flex size-40 items-center justify-center rounded-burbuja bg-mar-primarioSuave font-titulo text-titulo-xl text-mar-primario md:size-48">
            {iniciales}
          </span>
        )}
        <div className="flex flex-col items-start gap-4">
          <h3 className="text-titulo-m">{datos.nombre}</h3>
          {datos.descripcion && <p className="max-w-parrafo whitespace-pre-line text-destacado text-mar-tintaSuave">{datos.descripcion}</p>}
          {datos.campos.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {datos.campos.slice(0, 4).map((c) => (
                <li key={c.etiqueta} className="rounded-full bg-mar-primarioSuave px-3 py-1 text-meta font-bold text-mar-primario">
                  {c.etiqueta}: {c.valor}
                </li>
              ))}
            </ul>
          )}
          <Boton to="/quien-soy" variante="secundario" compacto>
            Conocé más
          </Boton>
        </div>
      </div>
    </Seccion>
  )
}
