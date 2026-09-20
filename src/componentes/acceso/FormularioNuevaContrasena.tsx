import { useState, type FormEvent } from 'react'
import { useSesion } from '../../auth/SesionContext'
import { mensajeDeError } from '../../auth/mensajes'
import type { ErrorAuth } from '../../auth/tipos'
import { enfocarCampo } from '../../lib/enfocar'
import { contrasenaValida, LARGO_MINIMO_CONTRASENA } from '../../lib/validar'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import CampoContrasena from './CampoContrasena'

type Errores = { nueva?: string; repetida?: string }

export default function FormularioNuevaContrasena({ onListo }: { onListo: () => void }) {
  const { cambiarContrasena } = useSesion()
  const [errores, setErrores] = useState<Errores>({})
  const [fallo, setFallo] = useState<ErrorAuth | null>(null)
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formulario = e.currentTarget
    const datos = new FormData(formulario)
    const nueva = String(datos.get('nueva') ?? '')
    const repetida = String(datos.get('repetida') ?? '')

    const nuevos: Errores = {
      nueva: contrasenaValida(nueva) ? undefined : `Necesita al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`,
      repetida: repetida === nueva ? undefined : 'Las dos contraseñas tienen que ser iguales.',
    }
    setErrores(nuevos)
    setFallo(null)
    if (nuevos.nueva) return enfocarCampo(formulario, 'nueva')
    if (nuevos.repetida) return enfocarCampo(formulario, 'repetida')

    setEnviando(true)
    const r = await cambiarContrasena(nueva)
    setEnviando(false)
    if (r.ok) return onListo()
    setFallo(r.error)
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <CampoContrasena
        etiqueta="Contraseña nueva"
        name="nueva"
        autoComplete="new-password"
        ayuda={`Al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`}
        error={errores.nueva}
      />
      <CampoContrasena etiqueta="Repetí la contraseña" name="repetida" autoComplete="new-password" error={errores.repetida} />
      {fallo && <Aviso>{mensajeDeError[fallo]}</Aviso>}
      <Boton type="submit" disabled={enviando} aria-busy={enviando} className="w-full">
        {enviando ? 'Guardando…' : 'Guardar la contraseña'}
      </Boton>
    </form>
  )
}
