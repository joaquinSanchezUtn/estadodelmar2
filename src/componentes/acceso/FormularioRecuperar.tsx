import { useState, type FormEvent } from 'react'
import { useSesion } from '../../auth/SesionContext'
import { mensajeDeError } from '../../auth/mensajes'
import type { ErrorAuth } from '../../auth/tipos'
import { enfocarCampo } from '../../lib/enfocar'
import { emailValido } from '../../lib/validar'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import Campo from '../base/Campo'

export default function FormularioRecuperar({ onEnviado }: { onEnviado: (email: string) => void }) {
  const { pedirRecuperacion } = useSesion()
  const [error, setError] = useState<string>()
  const [fallo, setFallo] = useState<ErrorAuth | null>(null)
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formulario = e.currentTarget
    const email = String(new FormData(formulario).get('email') ?? '')
    setFallo(null)
    if (!emailValido(email)) {
      setError('Escribí un email válido, por ejemplo nombre@correo.com.')
      return enfocarCampo(formulario, 'email')
    }
    setError(undefined)
    setEnviando(true)
    const r = await pedirRecuperacion(email)
    setEnviando(false)
    if (r.ok) return onEnviado(email)
    setFallo(r.error)
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <Campo etiqueta="Email" name="email" type="email" autoComplete="email" error={error} />
      {fallo && <Aviso>{mensajeDeError[fallo]}</Aviso>}
      <Boton type="submit" disabled={enviando} aria-busy={enviando} className="w-full">
        {enviando ? 'Enviando…' : 'Enviarme el enlace'}
      </Boton>
    </form>
  )
}
