import { useState } from 'react'
import { editarEcoAdmin, eliminarEcoAdmin, publicarEcoAdmin, type EcoAdmin } from '../../datos/ecos'
import type { ResultadoAdmin } from '../../datos/tipos'
import AreaTexto from '../base/AreaTexto'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import Sello from '../base/Sello'
import ConfirmarAccion from './ConfirmarAccion'

type Modo = 'ver' | 'editar' | 'borrar'

// Un eco en la lista del panel: se edita en el lugar, se oculta (sale de la rotación sin perderse) o se borra.
export default function FilaEco({ eco, onCambio }: { eco: EcoAdmin; onCambio: () => void }) {
  const [modo, setModo] = useState<Modo>('ver')
  const [texto, setTexto] = useState(eco.texto)
  const [pendiente, setPendiente] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hacer = async (accion: () => Promise<ResultadoAdmin>) => {
    setPendiente(true)
    const r = await accion()
    setPendiente(false)
    if (!r.ok) return setError(r.mensaje)
    setError(null)
    setModo('ver')
    onCambio()
  }

  if (modo === 'borrar')
    return (
      <li>
        <ConfirmarAccion
          titulo="¿Borrar este eco?"
          texto={`«${eco.texto}» No se puede deshacer. Si solo querés sacarlo de la rotación, ocultalo.`}
          confirmar="Borrar"
          pendiente={pendiente}
          error={error}
          onConfirmar={() => hacer(() => eliminarEcoAdmin(eco.id))}
          onCancelar={() => {
            setModo('ver')
            setError(null)
          }}
        />
      </li>
    )

  return (
    <li className="flex flex-col gap-3 rounded-tarjeta border border-mar-bordeAgua bg-mar-blanco p-4">
      {modo === 'editar' ? (
        <AreaTexto etiqueta={`Eco n.º ${eco.numero}`} rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} />
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="flex-1 text-cuerpo text-mar-tinta">{eco.texto}</p>
          <Sello tono={eco.publicado ? 'agua' : 'neutro'}>{eco.publicado ? 'En la rotación' : 'Oculto'}</Sello>
        </div>
      )}
      {error && <Aviso>{error}</Aviso>}
      <div className="flex flex-wrap gap-2">
        {modo === 'editar' ? (
          <>
            <Boton compacto onClick={() => hacer(() => editarEcoAdmin(eco.id, texto))} disabled={pendiente} aria-busy={pendiente}>
              {pendiente ? 'Guardando…' : 'Guardar'}
            </Boton>
            <Boton
              compacto
              variante="secundario"
              onClick={() => {
                setTexto(eco.texto)
                setModo('ver')
                setError(null)
              }}
            >
              Cancelar
            </Boton>
          </>
        ) : (
          <>
            <Boton compacto variante="secundario" onClick={() => setModo('editar')}>
              Editar
            </Boton>
            <Boton compacto variante="secundario" onClick={() => hacer(() => publicarEcoAdmin(eco.id, !eco.publicado))} disabled={pendiente}>
              {eco.publicado ? 'Ocultar' : 'Volver a mostrar'}
            </Boton>
            <Boton compacto variante="fantasma" onClick={() => setModo('borrar')}>
              Borrar
            </Boton>
          </>
        )}
      </div>
    </li>
  )
}
