import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSesion } from '../../auth/SesionContext'
import { mensajeDeError } from '../../auth/mensajes'
import type { ErrorAuth } from '../../auth/tipos'
import { enfocarCampo } from '../../lib/enfocar'
import { contrasenaValida, emailValido, LARGO_MINIMO_CONTRASENA } from '../../lib/validar'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import Campo from '../base/Campo'
import CampoContrasena from './CampoContrasena'

type Errores = { nombre?: string; email?: string; contrasena?: string; terminos?: string }

export default function FormularioRegistro() {
  const { registrar } = useSesion()
  const navegar = useNavigate()
  const [errores, setErrores] = useState<Errores>({})
  const [fallo, setFallo] = useState<ErrorAuth | null>(null)
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formulario = e.currentTarget
    const datos = new FormData(formulario)
    const nombre = String(datos.get('nombre') ?? '').trim()
    const email = String(datos.get('email') ?? '')
    const contrasena = String(datos.get('contrasena') ?? '')

    const nuevos: Errores = {
      nombre: nombre ? undefined : 'Contanos cómo te llamás.',
      email: emailValido(email) ? undefined : 'Escribí un email válido, por ejemplo nombre@correo.com.',
      contrasena: contrasenaValida(contrasena) ? undefined : `Necesita al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`,
      terminos: datos.get('terminos') ? undefined : 'Para crear la cuenta tenés que aceptar los términos.',
    }
    setErrores(nuevos)
    setFallo(null)
    const primero = (['nombre', 'email', 'contrasena', 'terminos'] as const).find((k) => nuevos[k])
    if (primero) return enfocarCampo(formulario, primero)

    setEnviando(true)
    const r = await registrar(nombre, email, contrasena)
    setEnviando(false)
    // La respuesta es la misma exista o no el email: no se revela qué cuentas hay.
    if (r.ok) return navegar('/verificar-email', { state: { email } })
    setFallo(r.error)
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <Campo etiqueta="Nombre" name="nombre" autoComplete="name" error={errores.nombre} />
      <Campo etiqueta="Email" name="email" type="email" autoComplete="email" error={errores.email} />
      <CampoContrasena
        etiqueta="Contraseña"
        name="contrasena"
        autoComplete="new-password"
        ayuda={`Al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`}
        error={errores.contrasena}
      />

      <div className="flex flex-col gap-2">
        <label className="flex min-h-control-sm items-start gap-3 py-2 text-cuerpo text-mar-tinta">
          <input
            type="checkbox"
            name="terminos"
            aria-invalid={errores.terminos ? true : undefined}
            className="mt-1 size-5 shrink-0 accent-mar-agua"
          />
          <span>
            Acepto los{' '}
            <Link to="/terminos" className="underline">
              términos
            </Link>{' '}
            y la{' '}
            <Link to="/privacidad" className="underline">
              política de privacidad
            </Link>
            .
          </span>
        </label>
        {errores.terminos && <p className="text-meta text-mar-coral">{errores.terminos}</p>}
      </div>

      {fallo && <Aviso>{mensajeDeError[fallo]}</Aviso>}

      <Boton type="submit" disabled={enviando} aria-busy={enviando} className="w-full">
        {enviando ? 'Creando tu cuenta…' : 'Crear cuenta'}
      </Boton>
    </form>
  )
}
