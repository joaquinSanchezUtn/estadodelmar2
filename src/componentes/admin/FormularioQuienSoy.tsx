import { useState, type FormEvent } from 'react'
import { guardarQuienSoyAdmin } from '../../datos/contenido'
import type { CampoPerfil, QuienSoy } from '../../datos/tipos'
import { useAccion } from '../../lib/useAccion'
import AreaTexto from '../base/AreaTexto'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import Campo from '../base/Campo'
import { Abajo, Arriba, Cerrar } from '../base/iconos'
import Interruptor from '../base/Interruptor'

type Props = { inicial: QuienSoy; onGuardado: () => void }
// Un id solo para React (identifica la fila mientras se edita, nunca viaja al servidor): sin esto,
// la key por posición hace que al reordenar o sacar una fila el foco salte a otro campo.
type CampoEnEdicion = CampoPerfil & { id: string }

const MAXIMO_DESCRIPCION = 2000
const boton = 'flex size-11 shrink-0 items-center justify-center rounded-full border border-mar-bordeControl bg-mar-blanco text-mar-tinta hover:bg-mar-aguaClara disabled:opacity-40'
const idNuevo = () => `nuevo-${Math.random().toString(36).slice(2, 10)}`

// Los datos de la dueña: foto, descripción libre y una lista de campos que ella arma como quiera
// (agregar, sacar, reordenar). Todo se guarda junto, de un saque: no hay una acción por fila como en
// las ventanas (acá no hace falta, es una sola tabla con una sola fila).
export default function FormularioQuienSoy({ inicial, onGuardado }: Props) {
  const [nombre, setNombre] = useState(inicial.nombre ?? '')
  const [descripcion, setDescripcion] = useState(inicial.descripcion ?? '')
  const [fotoUrl, setFotoUrl] = useState(inicial.fotoUrl ?? '')
  const [campos, setCampos] = useState<CampoEnEdicion[]>(() => inicial.campos.map((c) => ({ ...c, id: idNuevo() })))
  const [publicado, setPublicado] = useState(inicial.publicado)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const { pendiente, error, ejecutar } = useAccion()

  const cambiarCampo = (id: string, parte: Partial<CampoPerfil>) => setCampos((c) => c.map((campo) => (campo.id === id ? { ...campo, ...parte } : campo)))
  const sacarCampo = (id: string) => setCampos((c) => c.filter((campo) => campo.id !== id))
  const moverCampo = (i: number, direccion: -1 | 1) =>
    setCampos((c) => {
      const j = i + direccion
      if (j < 0 || j >= c.length) return c
      const copia = [...c]
      ;[copia[i], copia[j]] = [copia[j], copia[i]]
      return copia
    })
  const agregarCampo = () => setCampos((c) => [...c, { etiqueta: '', valor: '', id: idNuevo() }])

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    setErrores({})
    const ok = await ejecutar(async () => {
      const r = await guardarQuienSoyAdmin({ nombre, descripcion, fotoUrl, campos: campos.map(({ etiqueta, valor }) => ({ etiqueta, valor })), publicado })
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
    <form onSubmit={guardar} noValidate className="flex flex-col gap-5 rounded-tarjeta border border-mar-bordeAgua bg-mar-blanco p-5 md:p-6">
      <h2 className="text-titulo-s font-normal">Tus datos</h2>

      <Campo etiqueta="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} error={errores.nombre} autoComplete="off" />
      <Campo
        etiqueta="Foto"
        type="url"
        placeholder="https://…"
        value={fotoUrl}
        onChange={(e) => setFotoUrl(e.target.value)}
        ayuda="El enlace a una imagen ya subida (por ejemplo, la que te pasó Joaquin)."
        error={errores.fotoUrl}
        autoComplete="off"
      />
      <div className="flex flex-col gap-2">
        <AreaTexto
          etiqueta="Descripción"
          rows={5}
          maxLength={MAXIMO_DESCRIPCION}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          ayuda={`Se ve al principio de la página. ${descripcion.length} de ${MAXIMO_DESCRIPCION}.`}
          aria-invalid={errores.descripcion ? true : undefined}
        />
        {errores.descripcion && <p className="text-meta text-mar-coral">{errores.descripcion}</p>}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-cuerpo font-medium text-mar-tinta">Campos</h3>
          <Boton type="button" compacto variante="secundario" onClick={agregarCampo} disabled={campos.length >= 20}>
            Agregar campo
          </Boton>
        </div>
        <p className="text-meta text-mar-tintaSuave">Por ejemplo «Formación: Lic. en Psicología (UBA)» o «Especialidad: Ansiedad y vínculos». Se muestran en este orden.</p>

        {campos.length === 0 ? (
          <p className="text-cuerpo text-mar-tintaSuave">Todavía no agregaste ningún campo.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {campos.map((c, i) => (
              <li key={c.id} className="flex flex-col gap-2 rounded-control border border-mar-bordeAgua p-3 md:flex-row md:items-start">
                <div className="flex flex-1 flex-col gap-2 md:flex-row">
                  <Campo
                    etiqueta="Nombre del campo"
                    className="md:flex-1"
                    value={c.etiqueta}
                    onChange={(e) => cambiarCampo(c.id, { etiqueta: e.target.value })}
                    maxLength={60}
                    autoComplete="off"
                  />
                  <Campo etiqueta="Valor" className="md:flex-1" value={c.valor} onChange={(e) => cambiarCampo(c.id, { valor: e.target.value })} maxLength={300} autoComplete="off" />
                </div>
                <div className="flex items-center gap-2 md:pt-8">
                  <button type="button" className={boton} disabled={i === 0} aria-label={`Subir el campo «${c.etiqueta || 'sin nombre'}»`} onClick={() => moverCampo(i, -1)}>
                    <Arriba />
                  </button>
                  <button type="button" className={boton} disabled={i === campos.length - 1} aria-label={`Bajar el campo «${c.etiqueta || 'sin nombre'}»`} onClick={() => moverCampo(i, 1)}>
                    <Abajo />
                  </button>
                  <button type="button" className={boton} aria-label={`Quitar el campo «${c.etiqueta || 'sin nombre'}»`} onClick={() => sacarCampo(c.id)}>
                    <Cerrar className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {errores.campos && <p className="text-meta text-mar-coral">{errores.campos}</p>}
      </div>

      <Interruptor etiqueta="Publicada" ayuda={publicado ? 'Cualquiera puede verla en /quien-soy.' : 'Oculta: solo la ves vos.'} activo={publicado} onCambio={setPublicado} />
      {error && <Aviso>{error}</Aviso>}
      <div>
        <Boton type="submit" disabled={pendiente} aria-busy={pendiente}>
          {pendiente ? 'Guardando…' : 'Guardar los cambios'}
        </Boton>
      </div>
    </form>
  )
}
