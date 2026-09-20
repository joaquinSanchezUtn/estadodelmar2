import { useRef, useState, type FormEvent } from 'react'
import { useSesion } from '../../auth/SesionContext'
import { mensajeDeError } from '../../auth/mensajes'
import type { Usuario } from '../../datos/tipos'
import { enfocarCampo } from '../../lib/enfocar'
import { useAccion } from '../../lib/useAccion'
import { contrasenaValida, LARGO_MINIMO_CONTRASENA } from '../../lib/validar'
import CampoContrasena from '../acceso/CampoContrasena'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import Tarjeta from '../base/Tarjeta'

type Errores = { actual?: string; nueva?: string; repetida?: string }

export default function CambiarContrasena({ usuario, avisar }: { usuario: Usuario; avisar: (texto: string) => void }) {
  const { cambiarContrasenaActual } = useSesion()
  const [abierto, setAbierto] = useState(false)
  const [errores, setErrores] = useState<Errores>({})
  const { pendiente, error, ejecutar } = useAccion()
  const boton = useRef<HTMLButtonElement>(null)

  const cerrar = () => {
    setAbierto(false)
    setErrores({})
    setTimeout(() => boton.current?.focus())
  }

  const guardar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formulario = e.currentTarget
    const datos = new FormData(formulario)
    const actual = String(datos.get('actual') ?? '')
    const nueva = String(datos.get('nueva') ?? '')
    const repetida = String(datos.get('repetida') ?? '')

    const nuevos: Errores = {
      actual: actual ? undefined : 'Escribí tu contraseña actual.',
      nueva: contrasenaValida(nueva) ? undefined : `Necesita al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`,
      repetida: repetida === nueva ? undefined : 'Las dos contraseñas tienen que ser iguales.',
    }
    setErrores(nuevos)
    const primero = (['actual', 'nueva', 'repetida'] as const).find((k) => nuevos[k])
    if (primero) return enfocarCampo(formulario, primero)

    const ok = await ejecutar(async () => {
      const r = await cambiarContrasenaActual(actual, nueva)
      return r.ok ? null : mensajeDeError[r.error]
    })
    if (ok) {
      avisar('Cambiaste tu contraseña.')
      cerrar()
    }
  }

  return (
    <Tarjeta className="p-6">
      <h2 className="mb-2 text-titulo-s font-normal">Contraseña</h2>

      {usuario.conGoogle ? (
        <p className="text-cuerpo text-mar-tintaSuave">
          Ingresás con Google, así que no tenés una contraseña acá. Si querés cambiar cómo entrás, hacelo desde tu
          cuenta de Google.
        </p>
      ) : abierto ? (
        <form onSubmit={guardar} noValidate className="mt-4 flex flex-col gap-4">
          <CampoContrasena etiqueta="Contraseña actual" name="actual" autoComplete="current-password" autoFocus error={errores.actual} />
          <CampoContrasena
            etiqueta="Contraseña nueva"
            name="nueva"
            autoComplete="new-password"
            ayuda={`Al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`}
            error={errores.nueva}
          />
          <CampoContrasena etiqueta="Repetí la contraseña nueva" name="repetida" autoComplete="new-password" error={errores.repetida} />
          {error && <Aviso>{error}</Aviso>}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Boton type="submit" compacto disabled={pendiente} aria-busy={pendiente}>
              {pendiente ? 'Guardando…' : 'Guardar la contraseña'}
            </Boton>
            <Boton compacto variante="fantasma" onClick={cerrar} disabled={pendiente}>
              Cancelar
            </Boton>
          </div>
        </form>
      ) : (
        <>
          <p className="mb-5 text-cuerpo text-mar-tintaSuave">Elegí una contraseña nueva cuando quieras.</p>
          <Boton ref={boton} compacto variante="secundario" onClick={() => setAbierto(true)}>
            Cambiar mi contraseña
          </Boton>
        </>
      )}
    </Tarjeta>
  )
}
