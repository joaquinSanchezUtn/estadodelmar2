import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useSesion } from '../../auth/SesionContext'
import { mensajeDeError } from '../../auth/mensajes'
import type { ErrorAuth } from '../../auth/tipos'
import { enfocarCampo } from '../../lib/enfocar'
import { emailValido } from '../../lib/validar'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import Campo from '../base/Campo'
import CampoContrasena from './CampoContrasena'

type Errores = { email?: string; contrasena?: string }

export default function FormularioIngreso() {
  const { ingresar } = useSesion()
  const [errores, setErrores] = useState<Errores>({})
  const [fallo, setFallo] = useState<{ error: ErrorAuth; email: string } | null>(null)
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formulario = e.currentTarget
    const datos = new FormData(formulario)
    const email = String(datos.get('email') ?? '')
    const contrasena = String(datos.get('contrasena') ?? '')

    const nuevos: Errores = {
      email: emailValido(email) ? undefined : 'Escribí un email válido, por ejemplo nombre@correo.com.',
      contrasena: contrasena ? undefined : 'Escribí tu contraseña.',
    }
    setErrores(nuevos)
    setFallo(null)
    if (nuevos.email) return enfocarCampo(formulario, 'email')
    if (nuevos.contrasena) return enfocarCampo(formulario, 'contrasena')

    setEnviando(true)
    const r = await ingresar(email, contrasena)
    setEnviando(false)
    // Si salió bien, la pantalla se cierra sola: SoloVisitantes ve la sesión y te lleva de vuelta.
    if (!r.ok) setFallo({ error: r.error, email })
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <Campo etiqueta="Email" name="email" type="email" autoComplete="email" error={errores.email} />
      <CampoContrasena etiqueta="Contraseña" name="contrasena" autoComplete="current-password" error={errores.contrasena} />

      <div className="-mt-2">
        <Link to="/recuperar" className="inline-flex min-h-control-sm items-center text-cuerpo hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {fallo && (
        <Aviso>
          {mensajeDeError[fallo.error]}{' '}
          {fallo.error === 'sin-confirmar' && (
            <Link to="/verificar-email" state={{ email: fallo.email }} className="underline">
              Pedir otro correo
            </Link>
          )}
        </Aviso>
      )}

      <Boton type="submit" disabled={enviando} aria-busy={enviando} className="w-full">
        {enviando ? 'Ingresando…' : 'Ingresar'}
      </Boton>
    </form>
  )
}
