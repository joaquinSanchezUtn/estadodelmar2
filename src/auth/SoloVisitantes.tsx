import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { destinoSeguro } from './destino'
import { useSesion } from './SesionContext'

// Ingresar, crear cuenta y recuperar son para quien no tiene sesión. Quien ya la tiene (o la
// acaba de conseguir) vuelve a donde venía. Es solo experiencia de usuario: no protege ningún dato.
export default function SoloVisitantes({ children }: { children: ReactNode }) {
  const { usuario } = useSesion()
  const { state } = useLocation()
  if (usuario) return <Navigate to={destinoSeguro((state as { desde?: string } | null)?.desde)} replace />
  return children
}
