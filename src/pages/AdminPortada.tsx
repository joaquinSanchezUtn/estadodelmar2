import { useState } from 'react'
import Aviso from '../componentes/base/Aviso'
import Esqueleto from '../componentes/base/Esqueleto'
import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import FormularioPortada from '../componentes/admin/FormularioPortada'
import MarcoAdmin from '../componentes/admin/MarcoAdmin'
import { descartarAdmin } from '../componentes/admin/useDatosAdmin'
import { obtenerPortada } from '../datos/portada'
import { useCarga } from '../lib/useCarga'

const migas = [{ texto: 'Panel', to: '/admin' }, { texto: 'Portada' }]

// Los textos del principio de la home (portada y «Cómo funciona»). Una sola pantalla, como «Quién soy».
export default function AdminPortada() {
  const { datos, cargando, error, reintentar } = useCarga('admin:portada', obtenerPortada)
  const [aviso, setAviso] = useState<string | null>(null)

  return (
    <MarcoAdmin titulo="Portada" migas={migas}>
      {error ? (
        <ErrorDeCarga texto="No pudimos leer los textos de la portada." onReintentar={reintentar} />
      ) : cargando || !datos ? (
        <div role="status">
          <p className="sr-only">Cargando…</p>
          <Esqueleto className="h-96" />
        </div>
      ) : (
        <>
          {aviso && <Aviso tono="info">{aviso}</Aviso>}
          <FormularioPortada
            key={JSON.stringify(datos)}
            inicial={datos}
            onGuardado={() => {
              setAviso('Guardamos los cambios. Ya se ven en la home.')
              // La home guarda estos textos en la memoria pública: sin esto, al volver mostraría los viejos.
              descartarAdmin()
              reintentar()
            }}
          />
        </>
      )}
    </MarcoAdmin>
  )
}
