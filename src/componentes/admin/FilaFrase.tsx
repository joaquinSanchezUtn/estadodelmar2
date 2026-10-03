import { useState } from 'react'
import { editarFraseAdmin, eliminarFraseAdmin, publicarFraseAdmin, type FraseAdmin } from '../../datos/frases'
import { g, SECCIONES_DE_FRASES, type SeccionDeFrases } from '../../datos/seccionesDeFrases'
import type { ResultadoAdmin } from '../../datos/tipos'
import AreaTexto from '../base/AreaTexto'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import Sello from '../base/Sello'
import ConfirmarAccion from './ConfirmarAccion'

type Modo = 'ver' | 'editar' | 'borrar'
type Props = { seccion: SeccionDeFrases; frase: FraseAdmin; onCambio: () => void }

// Una frase en la lista del panel: se edita en el lugar, se oculta (sale de la rotación sin perderse) o se borra.
export default function FilaFrase({ seccion, frase, onCambio }: Props) {
  const c = SECCIONES_DE_FRASES[seccion]
  const [modo, setModo] = useState<Modo>('ver')
  const [texto, setTexto] = useState(frase.texto)
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
  const volver = () => {
    setTexto(frase.texto)
    setModo('ver')
    setError(null)
  }

  if (modo === 'borrar')
    return (
      <li>
        <ConfirmarAccion
          titulo={`¿Borrar ${g(c, 'esta', 'este')} ${c.singular}?`}
          texto={`«${frase.texto}» No se puede deshacer. Si solo querés sacar${g(c, 'la', 'lo')} de la rotación, ocultal${g(c, 'a', 'o')}.`}
          confirmar="Borrar"
          pendiente={pendiente}
          error={error}
          onConfirmar={() => hacer(() => eliminarFraseAdmin(seccion, frase.id))}
          onCancelar={volver}
        />
      </li>
    )

  return (
    <li className="flex flex-col gap-3 rounded-tarjeta border border-mar-bordeAgua bg-mar-blanco p-4">
      {modo === 'editar' ? (
        <AreaTexto etiqueta={`${c.singular[0].toUpperCase()}${c.singular.slice(1)} n.º ${frase.numero}`} rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} />
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="flex-1 text-cuerpo text-mar-tinta">{frase.texto}</p>
          <Sello tono={frase.publicado ? 'agua' : 'neutro'}>{frase.publicado ? 'En la rotación' : g(c, 'Oculta', 'Oculto')}</Sello>
        </div>
      )}
      {error && <Aviso>{error}</Aviso>}
      <div className="flex flex-wrap gap-2">
        {modo === 'editar' ? (
          <>
            <Boton compacto onClick={() => hacer(() => editarFraseAdmin(seccion, frase.id, texto))} disabled={pendiente} aria-busy={pendiente}>
              {pendiente ? 'Guardando…' : 'Guardar'}
            </Boton>
            <Boton compacto variante="secundario" onClick={volver}>
              Cancelar
            </Boton>
          </>
        ) : (
          <>
            <Boton compacto variante="secundario" onClick={() => setModo('editar')}>
              Editar
            </Boton>
            <Boton compacto variante="secundario" onClick={() => hacer(() => publicarFraseAdmin(seccion, frase.id, !frase.publicado))} disabled={pendiente}>
              {frase.publicado ? 'Ocultar' : 'Volver a mostrar'}
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
