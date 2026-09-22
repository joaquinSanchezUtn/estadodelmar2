import { useState } from 'react'
import Aviso from '../componentes/base/Aviso'
import Esqueleto from '../componentes/base/Esqueleto'
import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import FormularioQuienSoy from '../componentes/admin/FormularioQuienSoy'
import MarcoAdmin from '../componentes/admin/MarcoAdmin'
import { obtenerQuienSoy } from '../datos/contenido'
import { useCarga } from '../lib/useCarga'

const migas = [{ texto: 'Panel', to: '/admin' }, { texto: 'Quién soy' }]

// Los datos de la dueña que se ven en /quien-soy. A diferencia de las ventanas, es una sola pantalla:
// no hay lista, se edita directo.
export default function AdminQuienSoy() {
  const { datos, cargando, error, reintentar } = useCarga('admin:quien-soy', obtenerQuienSoy)
  const [aviso, setAviso] = useState<string | null>(null)

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
          <FormularioQuienSoy
            key={JSON.stringify(datos)}
            inicial={datos}
            onGuardado={() => {
              setAviso('Guardamos los cambios.')
              reintentar()
            }}
          />
        </>
      )}
    </MarcoAdmin>
  )
}
