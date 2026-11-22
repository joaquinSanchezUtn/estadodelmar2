import { useState } from 'react'
import Aviso from '../componentes/base/Aviso'
import Esqueleto from '../componentes/base/Esqueleto'
import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import FormularioPortada, { type ParteDePortada } from '../componentes/admin/FormularioPortada'
import MarcoAdmin from '../componentes/admin/MarcoAdmin'
import { descartarAdmin } from '../componentes/admin/useDatosAdmin'
import { obtenerPortada } from '../datos/portada'
import { useCarga } from '../lib/useCarga'

const titulos: Record<ParteDePortada, string> = {
  portada: 'Portada',
  como: 'Cómo funciona',
}

// Los textos del principio de la home: /admin/portada y /admin/como-funciona son esta misma pantalla, cada
// una con su parte (las dos viven en la fila de `portada`). Se edita directo, como «Quién soy».
export default function AdminPortada({ parte }: { parte: ParteDePortada }) {
  const titulo = titulos[parte]
  const { datos, cargando, error, reintentar } = useCarga('admin:portada', obtenerPortada)
  const [aviso, setAviso] = useState<string | null>(null)

  return (
    <MarcoAdmin titulo={titulo} migas={[{ texto: 'Panel', to: '/admin' }, { texto: 'Textos de la página', to: '/admin/textos' }, { texto: titulo }]}>
      {error ? (
        <ErrorDeCarga texto="No pudimos leer los textos." onReintentar={reintentar} />
      ) : cargando || !datos ? (
        <div role="status">
          <p className="sr-only">Cargando…</p>
          <Esqueleto className="h-96" />
        </div>
      ) : (
        <>
          {aviso && <Aviso tono="info">{aviso}</Aviso>}
          <FormularioPortada
            parte={parte}
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
