import { useRef, useState, type FormEvent } from 'react'
import { useSesion } from '../../auth/SesionContext'
import { mensajeDeError } from '../../auth/mensajes'
import type { Usuario } from '../../datos/tipos'
import { useAccion } from '../../lib/useAccion'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import Campo from '../base/Campo'
import Tarjeta from '../base/Tarjeta'

type Props = { usuario: Usuario; avisar: (texto: string) => void }

// Nombre editable. El email no se cambia desde acá: es la llave de la cuenta.
export default function DatosCuenta({ usuario, avisar }: Props) {
  const { actualizarPerfil } = useSesion()
  const [editando, setEditando] = useState(false)
  const [errorDeCampo, setErrorDeCampo] = useState<string>()
  const { pendiente, error, ejecutar } = useAccion()
  const botonEditar = useRef<HTMLButtonElement>(null)

  const cerrar = () => {
    setEditando(false)
    setErrorDeCampo(undefined)
    setTimeout(() => botonEditar.current?.focus())
  }

  const guardar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const nombre = String(new FormData(e.currentTarget).get('nombre') ?? '').trim()
    if (!nombre) return setErrorDeCampo('Contanos cómo te llamás.')
    setErrorDeCampo(undefined)
    const ok = await ejecutar(async () => {
      const r = await actualizarPerfil(nombre)
      return r.ok ? null : mensajeDeError[r.error]
    })
    if (ok) {
      avisar('Guardamos tu nombre.')
      cerrar()
    }
  }

  return (
    <Tarjeta className="p-6 shadow-suave">
      <h2 className="mb-4 text-titulo-s font-normal">Tus datos</h2>

      {editando ? (
        <form onSubmit={guardar} noValidate className="flex flex-col gap-4">
          <Campo etiqueta="Nombre" name="nombre" defaultValue={usuario.nombre} autoComplete="name" autoFocus error={errorDeCampo} />
          {error && <Aviso>{error}</Aviso>}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Boton type="submit" compacto disabled={pendiente} aria-busy={pendiente}>
              {pendiente ? 'Guardando…' : 'Guardar'}
            </Boton>
            <Boton compacto variante="fantasma" onClick={cerrar} disabled={pendiente}>
              Cancelar
            </Boton>
          </div>
        </form>
      ) : (
        <>
          <dl className="flex flex-col gap-3">
            <div>
              <dt className="text-meta text-mar-tintaSuave">Nombre</dt>
              <dd className="text-cuerpo text-mar-tinta">{usuario.nombre}</dd>
            </div>
            <div>
              <dt className="text-meta text-mar-tintaSuave">Email</dt>
              <dd className="break-words text-cuerpo text-mar-tinta">{usuario.email}</dd>
            </div>
          </dl>
          {usuario.conGoogle && <p className="mt-3 text-meta text-mar-tintaSuave">Ingresás con tu cuenta de Google.</p>}
          <Boton ref={botonEditar} compacto variante="secundario" onClick={() => setEditando(true)} className="mt-5">
            Editar el nombre
          </Boton>
        </>
      )}
    </Tarjeta>
  )
}
