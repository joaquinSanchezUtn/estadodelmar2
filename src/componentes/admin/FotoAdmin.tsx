import { useRef, type ChangeEvent, type ReactNode } from 'react'
import { FOTO_MAXIMA_MB, TIPOS_DE_FOTO } from '../../datos/fotos'
import type { ResultadoAdmin } from '../../datos/tipos'
import { prepararFoto } from '../../lib/prepararFoto'
import { useAccion } from '../../lib/useAccion'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'

type Props = {
  // Cómo se ve hoy (la foto o, si no hay, lo que la reemplaza).
  vista: ReactNode
  tieneFoto: boolean
  // Qué se ve cuando se quita la foto, para el aviso: "el dibujo de su aspecto".
  sinFoto: string
  subir: (foto: Blob) => Promise<ResultadoAdmin>
  quitar: () => Promise<ResultadoAdmin>
  onCambio: (aviso: string) => void
}

// La foto de una ventana o de un tema: se sube apenas se elige (ya achicada, ver `prepararFoto`), se cambia
// o se quita.
export default function FotoAdmin({ vista, tieneFoto, sinFoto, subir, quitar, onCambio }: Props) {
  const entrada = useRef<HTMLInputElement>(null)
  const accion = useAccion()

  const elegir = (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    accion.ejecutar(async () => {
      if (!TIPOS_DE_FOTO[archivo.type]) return 'La foto tiene que ser JPG, PNG o WebP.'
      if (archivo.size > 30 * 1024 * 1024) return 'Esa foto es demasiado pesada. Probá con una más chica.'
      const r = await subir(await prepararFoto(archivo))
      if (!r.ok) return r.mensaje
      onCambio('Listo: ya tiene su foto nueva.')
      return null
    })
  }

  const sacar = () =>
    accion.ejecutar(async () => {
      const r = await quitar()
      if (!r.ok) return r.mensaje
      onCambio(`Quitaste la foto: ahora se ve ${sinFoto}.`)
      return null
    })

  return (
    <section aria-labelledby="titulo-foto" className="flex flex-col gap-4 rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-6 shadow-suave">
      <h2 id="titulo-foto" className="text-titulo-s font-normal">
        Foto
      </h2>
      {vista}
      <p className="text-meta text-mar-tintaSuave">
        JPG, PNG o WebP. Se achica sola antes de subirse (y se le borran los datos de ubicación). En las tarjetas se recorta para llenar el espacio de la imagen. Sin foto se ve {sinFoto}.
      </p>
      <input ref={entrada} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={elegir} />
      {accion.error && <Aviso>{accion.error}</Aviso>}
      <div className="flex flex-wrap gap-2">
        <Boton variante="secundario" onClick={() => entrada.current?.click()} disabled={accion.pendiente} aria-busy={accion.pendiente}>
          {accion.pendiente ? 'Un momento…' : tieneFoto ? 'Cambiar la foto' : 'Subir una foto'}
        </Boton>
        {tieneFoto && (
          <Boton variante="fantasma" onClick={sacar} disabled={accion.pendiente}>
            Quitar la foto
          </Boton>
        )}
      </div>
      <p className="text-meta text-mar-tintaSuave">Hasta {FOTO_MAXIMA_MB} MB una vez achicada.</p>
    </section>
  )
}
