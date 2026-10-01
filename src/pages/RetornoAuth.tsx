import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSesion } from '../auth/SesionContext'
import { mensajeDeError } from '../auth/mensajes'
import type { ErrorAuth, TipoRetorno } from '../auth/tipos'
import PaginaDeAcceso from '../componentes/acceso/PaginaDeAcceso'
import Boton from '../componentes/base/Boton'

const tipos: TipoRetorno[] = ['google', 'confirmacion', 'recuperacion']

// A donde vuelve la persona desde Google o desde un enlace del correo. Completa el acceso y sigue;
// si el enlace venció o ya se usó, lo dice y ofrece otro camino.
export default function RetornoAuth() {
  const [params] = useSearchParams()
  const { completarRetorno } = useSesion()
  const navegar = useNavigate()
  const [error, setError] = useState<ErrorAuth | null>(null)
  const hecho = useRef(false) // el enlace se usa una sola vez: no repetir el pedido

  useEffect(() => {
    if (hecho.current) return
    hecho.current = true
    const tipo = params.get('tipo') as TipoRetorno | null
    if (!tipo || !tipos.includes(tipo) || params.get('error')) return setError('enlace-invalido')
    completarRetorno(tipo).then((r) => {
      // Quien acaba de confirmar su email va a Mi cuenta, que es donde se activa el plan: si cae en la
      // home tiene que adivinar dónde seguir.
      if (r.ok) navegar(r.recuperacion ? '/nueva-contrasena' : tipo === 'confirmacion' ? '/mi-cuenta' : '/', { replace: true, state: tipo === 'confirmacion' ? { aviso: 'bienvenida' } : undefined })
      else setError(r.error)
    })
  }, [params, completarRetorno, navegar])

  if (!error) {
    return (
      <PaginaDeAcceso titulo="Un momento…" texto="Estamos confirmando tu acceso.">
        <p role="status" className="sr-only">
          Confirmando tu acceso
        </p>
      </PaginaDeAcceso>
    )
  }

  // Desde Google no hay "enlace que venció": lo más común es que la persona cerró o canceló el permiso.
  if (params.get('tipo') === 'google') {
    return (
      <PaginaDeAcceso titulo="No pudimos entrar con Google" texto="Se canceló o no se pudo completar. Probá de nuevo, o entrá con tu email.">
        <Boton to="/ingresar">Volver a ingresar</Boton>
      </PaginaDeAcceso>
    )
  }

  return (
    <PaginaDeAcceso titulo="No pudimos completar el acceso" texto={mensajeDeError[error]}>
      <div className="flex flex-col gap-3">
        <Boton to="/ingresar">Volver a ingresar</Boton>
        <Boton to="/recuperar" variante="fantasma">
          Pedir otro enlace
        </Boton>
      </div>
    </PaginaDeAcceso>
  )
}
