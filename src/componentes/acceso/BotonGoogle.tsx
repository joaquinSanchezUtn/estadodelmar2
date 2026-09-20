import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSesion } from '../../auth/SesionContext'
import { mensajeDeError } from '../../auth/mensajes'
import type { ErrorAuth } from '../../auth/tipos'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import { Google } from '../base/iconos'

// Ingresar y crear cuenta con Google son lo mismo: la cuenta se crea la primera vez que se entra.
// Con Supabase esta llamada redirige a Google y la persona vuelve a /auth/callback.
export default function BotonGoogle() {
  const { ingresarConGoogle } = useSesion()
  const navegar = useNavigate()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<ErrorAuth | null>(null)

  const continuar = async () => {
    setCargando(true)
    setError(null)
    const r = await ingresarConGoogle()
    if (r.ok) return navegar('/auth/callback?tipo=google')
    setCargando(false)
    setError(r.error)
  }

  return (
    <div className="flex flex-col gap-3">
      <Boton variante="secundario" onClick={continuar} disabled={cargando} aria-busy={cargando} className="w-full gap-3 bg-mar-blanco">
        <Google />
        {cargando ? 'Conectando con Google…' : 'Continuar con Google'}
      </Boton>
      {error && <Aviso>{mensajeDeError[error]}</Aviso>}
    </div>
  )
}
