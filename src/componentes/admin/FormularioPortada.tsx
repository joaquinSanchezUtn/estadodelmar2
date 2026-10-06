import { useState, type FormEvent } from 'react'
import { guardarPortadaAdmin } from '../../datos/portada'
import type { TextosDePortada } from '../../datos/tipos'
import { useAccion } from '../../lib/useAccion'
import AreaTexto from '../base/AreaTexto'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import Campo from '../base/Campo'
import TarjetasComoFunciona, { idNuevo, type PasoEnEdicion } from './TarjetasComoFunciona'

type Props = { inicial: TextosDePortada; onGuardado: () => void }

const tarjeta = 'flex flex-col gap-5 rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-5 shadow-suave md:p-8'

// Los textos del principio de la home: la portada y «Cómo funciona». Todo se guarda junto, de un saque.
export default function FormularioPortada({ inicial, onGuardado }: Props) {
  const [etiqueta, setEtiqueta] = useState(inicial.etiqueta ?? '')
  const [titulo, setTitulo] = useState(inicial.titulo)
  const [tituloDestacado, setTituloDestacado] = useState(inicial.tituloDestacado ?? '')
  const [texto, setTexto] = useState(inicial.texto ?? '')
  const [comoTitulo, setComoTitulo] = useState(inicial.comoTitulo)
  const [comoTexto, setComoTexto] = useState(inicial.comoTexto ?? '')
  const [pasos, setPasos] = useState<PasoEnEdicion[]>(() => inicial.pasos.map((p) => ({ ...p, id: idNuevo() })))
  const [errores, setErrores] = useState<Record<string, string>>({})
  const { pendiente, error, ejecutar } = useAccion()

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    setErrores({})
    const ok = await ejecutar(async () => {
      const r = await guardarPortadaAdmin({
        etiqueta,
        titulo,
        tituloDestacado,
        texto,
        comoTitulo,
        comoTexto,
        pasos: pasos.map(({ titulo: t, texto: x }) => ({ titulo: t, texto: x })),
      })
      if (r.ok) {
        onGuardado()
        return null
      }
      setErrores(r.errores ?? {})
      return r.mensaje
    })
    if (!ok) document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }

  return (
    <form onSubmit={guardar} noValidate className="flex flex-col gap-6">
      <section className={tarjeta}>
        <h2 className="text-titulo-s font-normal">Portada</h2>
        <p className="text-meta text-mar-tintaSuave">Lo primero que se ve al entrar al sitio. Lo que dejes vacío (salvo el título) no se muestra.</p>
        <Campo etiqueta="Etiqueta" ayuda="La pastilla chica de arriba del título." value={etiqueta} onChange={(e) => setEtiqueta(e.target.value)} maxLength={60} error={errores.etiqueta} autoComplete="off" />
        <Campo etiqueta="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={80} error={errores.titulo} autoComplete="off" />
        <Campo
          etiqueta="Segundo renglón del título"
          ayuda="Va abajo del título, en azul."
          value={tituloDestacado}
          onChange={(e) => setTituloDestacado(e.target.value)}
          maxLength={80}
          error={errores.tituloDestacado}
          autoComplete="off"
        />
        <div className="flex flex-col gap-2">
          <AreaTexto
            etiqueta="Texto"
            rows={3}
            maxLength={400}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            ayuda={`${texto.length} de 400.`}
            aria-invalid={errores.texto ? true : undefined}
          />
          {errores.texto && <p className="text-meta text-mar-coral">{errores.texto}</p>}
        </div>
      </section>

      <section className={tarjeta}>
        <h2 className="text-titulo-s font-normal">Cómo funciona</h2>
        <Campo etiqueta="Título" value={comoTitulo} onChange={(e) => setComoTitulo(e.target.value)} maxLength={60} error={errores.comoTitulo} autoComplete="off" />
        <Campo etiqueta="Subtítulo" value={comoTexto} onChange={(e) => setComoTexto(e.target.value)} maxLength={200} error={errores.comoTexto} autoComplete="off" />
        <TarjetasComoFunciona pasos={pasos} onCambio={setPasos} error={errores.pasos} />
      </section>

      {error && <Aviso>{error}</Aviso>}
      <div>
        <Boton type="submit" disabled={pendiente} aria-busy={pendiente}>
          {pendiente ? 'Guardando…' : 'Guardar los cambios'}
        </Boton>
      </div>
    </form>
  )
}
