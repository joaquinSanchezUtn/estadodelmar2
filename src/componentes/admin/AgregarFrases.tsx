import { useState, type FormEvent } from 'react'
import { agregarFrasesAdmin, separarFrases } from '../../datos/frases'
import { g, SECCIONES_DE_FRASES, type SeccionDeFrases } from '../../datos/seccionesDeFrases'
import AreaTexto from '../base/AreaTexto'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'

type Props = { seccion: SeccionDeFrases; onAgregadas: () => void }

// Sumar frases nuevas a una sección: una por renglón, así se puede pegar una tanda entera del documento de
// una vez. Las nuevas entran publicadas y al final de la rotación.
export default function AgregarFrases({ seccion, onAgregadas }: Props) {
  const c = SECCIONES_DE_FRASES[seccion]
  const [texto, setTexto] = useState('')
  const [pendiente, setPendiente] = useState(false)
  const [resultado, setResultado] = useState<{ ok: boolean; mensaje: string } | null>(null)
  const cantidad = separarFrases(texto).length

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setPendiente(true)
    const r = await agregarFrasesAdmin(seccion, separarFrases(texto))
    setPendiente(false)
    if (!r.ok) return setResultado({ ok: false, mensaje: r.mensaje })
    setResultado({ ok: true, mensaje: cantidad === 1 ? `Listo: se sumó ${g(c, 'una', 'un')} ${c.singular}.` : `Listo: se sumaron ${cantidad} ${c.plural}.` })
    setTexto('')
    onAgregadas()
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4 rounded-tarjeta border border-mar-bordeAgua bg-mar-blanco p-5 shadow-suave">
      <h2 className="text-titulo-s font-normal">Sumar {c.plural}</h2>
      <AreaTexto
        etiqueta={`${c.plural[0].toUpperCase()}${c.plural.slice(1)} ${g(c, 'nuevas', 'nuevos')}`}
        ayuda={`${g(c, 'Una', 'Uno')} por renglón. Podés pegar ${g(c, 'varias juntas', 'varios juntos')}.`}
        rows={4}
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value)
          setResultado(null)
        }}
      />
      {resultado && <Aviso tono={resultado.ok ? 'info' : 'error'}>{resultado.mensaje}</Aviso>}
      <div>
        <Boton type="submit" disabled={pendiente || cantidad === 0} aria-busy={pendiente}>
          {pendiente ? 'Guardando…' : cantidad > 1 ? `Sumar ${cantidad} ${c.plural}` : `Sumar ${c.singular}`}
        </Boton>
      </div>
    </form>
  )
}
