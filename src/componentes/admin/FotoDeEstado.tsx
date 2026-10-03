import { useRef, type ChangeEvent } from 'react'
import { FOTO_MAXIMA_MB, quitarFotoEstadoAdmin, subirFotoEstadoAdmin, TIPOS_DE_FOTO } from '../../datos/estados'
import type { EstadoMarAdmin } from '../../datos/tipos'
import { cn } from '../../lib/cn'
import { prepararFoto } from '../../lib/prepararFoto'
import { useAccion } from '../../lib/useAccion'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import ImagenDeVentana from '../objetos/ImagenDeVentana'
import { coloresDe } from '../objetos/estados/colores'

type Props = { estado: EstadoMarAdmin; onCambio: (aviso: string) => void }

// La foto de una ventana: se sube apenas se elige (ya achicada, ver `prepararFoto`), se cambia o se quita.
// Sin foto, la tarjeta muestra el dibujo de su aspecto.
export default function FotoDeEstado({ estado, onCambio }: Props) {
  const entrada = useRef<HTMLInputElement>(null)
  const accion = useAccion()

  const elegir = (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    accion.ejecutar(async () => {
      if (!TIPOS_DE_FOTO[archivo.type]) return 'La foto tiene que ser JPG, PNG o WebP.'
      if (archivo.size > 30 * 1024 * 1024) return 'Esa foto es demasiado pesada. Probá con una más chica.'
      const foto = await prepararFoto(archivo)
      const r = await subirFotoEstadoAdmin(estado.id, foto)
      if (!r.ok) return r.mensaje
      onCambio('Listo: la ventana ya tiene su foto nueva.')
      return null
    })
  }

  const quitar = () =>
    accion.ejecutar(async () => {
      const r = await quitarFotoEstadoAdmin(estado.id)
      if (!r.ok) return r.mensaje
      onCambio('Quitaste la foto: ahora se ve el dibujo de su aspecto.')
      return null
    })

  return (
    <section aria-labelledby="titulo-foto" className="flex flex-col gap-4 rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-6 shadow-suave">
      <h2 id="titulo-foto" className="text-titulo-s font-normal">
        Foto
      </h2>
      <span aria-hidden="true" className={cn('relative block aspect-[3/2] w-full max-w-parrafo overflow-hidden rounded-tarjeta', coloresDe(estado.estilo).agua)}>
        <ImagenDeVentana estado={estado} vivo="siempre" autonomo />
      </span>
      <p className="text-meta text-mar-tintaSuave">
        JPG, PNG o WebP. Se achica sola antes de subirse (y se le borran los datos de ubicación). En la tarjeta se recorta para llenar el espacio de la imagen.
      </p>
      <input ref={entrada} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={elegir} />
      {accion.error && <Aviso>{accion.error}</Aviso>}
      <div className="flex flex-wrap gap-2">
        <Boton variante="secundario" onClick={() => entrada.current?.click()} disabled={accion.pendiente} aria-busy={accion.pendiente}>
          {accion.pendiente ? 'Subiendo…' : estado.fotoUrl ? 'Cambiar la foto' : 'Subir una foto'}
        </Boton>
        {estado.fotoUrl && (
          <Boton variante="fantasma" onClick={quitar} disabled={accion.pendiente}>
            Quitar la foto
          </Boton>
        )}
      </div>
      <p className="text-meta text-mar-tintaSuave">Hasta {FOTO_MAXIMA_MB} MB una vez achicada.</p>
    </section>
  )
}
