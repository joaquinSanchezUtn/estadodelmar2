import { useState, type FormEvent } from 'react'
import { agregarEcosAdmin, separarEcos } from '../../datos/ecos'
import AreaTexto from '../base/AreaTexto'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'

// Sumar ecos nuevos: uno por renglón, así se puede pegar una tanda entera del documento de una vez.
// Los nuevos entran publicados y al final de la rotación.
export default function AgregarEcos({ onAgregados }: { onAgregados: () => void }) {
  const [texto, setTexto] = useState('')
  const [pendiente, setPendiente] = useState(false)
  const [resultado, setResultado] = useState<{ ok: boolean; mensaje: string } | null>(null)
  const cantidad = separarEcos(texto).length

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setPendiente(true)
    const r = await agregarEcosAdmin(separarEcos(texto))
    setPendiente(false)
    if (!r.ok) return setResultado({ ok: false, mensaje: r.mensaje })
    setResultado({ ok: true, mensaje: cantidad === 1 ? 'Listo: se sumó un eco.' : `Listo: se sumaron ${cantidad} ecos.` })
    setTexto('')
    onAgregados()
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4 rounded-tarjeta border border-mar-bordeAgua bg-mar-blanco p-5 shadow-suave">
      <h2 className="text-titulo-s font-normal">Sumar ecos</h2>
      <AreaTexto
        etiqueta="Ecos nuevos"
        ayuda="Uno por renglón. Podés pegar varios juntos."
        rows={4}
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value)
          setResultado(null)
        }}
      />
      {resultado && (
        <Aviso tono={resultado.ok ? 'info' : 'error'}>{resultado.mensaje}</Aviso>
      )}
      <div>
        <Boton type="submit" disabled={pendiente || cantidad === 0} aria-busy={pendiente}>
          {pendiente ? 'Guardando…' : cantidad > 1 ? `Sumar ${cantidad} ecos` : 'Sumar eco'}
        </Boton>
      </div>
    </form>
  )
}
