import { useState } from 'react'
import Aviso from '../componentes/base/Aviso'
import Esqueleto from '../componentes/base/Esqueleto'
import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import FormularioQuienSoy from '../componentes/admin/FormularioQuienSoy'
import FotoAdmin from '../componentes/admin/FotoAdmin'
import MarcoAdmin from '../componentes/admin/MarcoAdmin'
import { obtenerQuienSoy, quitarFotoQuienSoyAdmin, subirFotoQuienSoyAdmin } from '../datos/contenido'
import { useCarga } from '../lib/useCarga'

const migas = [{ texto: 'Panel', to: '/admin' }, { texto: 'Textos de la página', to: '/admin/textos' }, { texto: 'Quién soy' }]

// Los datos de la dueña que se ven en /quien-soy. A diferencia de las ventanas, es una sola pantalla:
// no hay lista, se edita directo.
export default function AdminQuienSoy() {
  const { datos, cargando, error, reintentar } = useCarga('admin:quien-soy', obtenerQuienSoy)
  const [aviso, setAviso] = useState<string | null>(null)
  const iniciales = (datos?.nombre || 'Quién soy').split(' ').map((p) => p[0]).slice(0, 2).join('')
  const avisar = (texto: string) => {
    setAviso(texto)
    reintentar()
  }

  return (
    <MarcoAdmin titulo="Quién soy" migas={migas}>
      {error ? (
        <ErrorDeCarga texto="No pudimos leer tus datos." onReintentar={reintentar} />
      ) : cargando || !datos ? (
        <div role="status">
          <p className="sr-only">Cargando…</p>
          <Esqueleto className="h-96" />
        </div>
      ) : (
        <>
          {aviso && <Aviso tono="info">{aviso}</Aviso>}
          <FotoAdmin
            vista={
              datos.fotoUrl ? (
                <img src={datos.fotoUrl} alt="" className="size-40 rounded-burbujaGrande object-cover md:size-56" />
              ) : (
                <span aria-hidden="true" className="flex size-40 items-center justify-center rounded-burbujaGrande bg-mar-primarioSuave font-titulo text-titulo-xl text-mar-primario md:size-56">
                  {iniciales}
                </span>
              )
            }
            tieneFoto={!!datos.fotoUrl}
            sinFoto="tus iniciales"
            subir={subirFotoQuienSoyAdmin}
            quitar={quitarFotoQuienSoyAdmin}
            onCambio={avisar}
          />
          {/* La key no mira la foto: cambiarla no puede borrar lo que se esté escribiendo sin guardar en el formulario. */}
          <FormularioQuienSoy key={JSON.stringify({ ...datos, fotoUrl: null })} inicial={datos} onGuardado={() => avisar('Guardamos los cambios.')} />
        </>
      )}
    </MarcoAdmin>
  )
}
