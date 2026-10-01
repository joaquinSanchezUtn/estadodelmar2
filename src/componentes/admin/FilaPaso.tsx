import { publicarContenidoAdmin, publicarTemaAdmin } from '../../datos/admin'
import { useAccion } from '../../lib/useAccion'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import type { Paso } from './pasos'

type Props = { paso: Paso; onCambio: (aviso: string) => void }

// Un paso de la lista. Si se resuelve publicando, el botón lo hace ahí mismo; siempre queda el enlace a
// la pantalla donde se puede revisar antes.
export default function FilaPaso({ paso, onCambio }: Props) {
  const { pendiente, error, ejecutar } = useAccion()
  const p = paso.publicar

  const publicar = () =>
    ejecutar(async () => {
      if (!p) return null
      const r = 'pieza' in p ? await publicarContenidoAdmin(p.pieza, true) : await publicarTemaAdmin(p.tema, true)
      if (!r.ok) return r.mensaje
      onCambio(`Listo: ${paso.texto.replace(/^Publicar /, 'publicaste ').replace(/\.$/, '')}.`)
      return null
    })

  return (
    <li className="flex flex-col gap-2 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <span className="text-cuerpo text-mar-tinta">{paso.texto}</span>
        <div className="flex shrink-0 items-center gap-2">
          {p && (
            <Boton compacto onClick={publicar} disabled={pendiente} aria-busy={pendiente} aria-label={paso.texto}>
              {pendiente ? 'Publicando…' : 'Publicar'}
            </Boton>
          )}
          <Boton to={paso.to} compacto variante={p ? 'fantasma' : 'secundario'} aria-label={`${paso.accion}: ${paso.texto}`}>
            {paso.accion}
          </Boton>
        </div>
      </div>
      {error && <Aviso>{error}</Aviso>}
    </li>
  )
}
