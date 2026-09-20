import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// Sesión actual y rol leído de profiles.
// Es solo para la experiencia de usuario: la protección real vive en RLS.
export function useSesion() {
  const [sesion, setSesion] = useState<Session | null>(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_evento, nueva) => {
      setSesion(nueva)
      if (!nueva) {
        setEsAdmin(false)
        setCargando(false)
      }
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const usuarioId = sesion?.user.id

  useEffect(() => {
    if (!usuarioId) return
    let vigente = true
    setCargando(true)
    supabase
      .from('profiles')
      .select('role')
      .eq('id', usuarioId)
      .single()
      .then(({ data }) => {
        if (!vigente) return
        setEsAdmin(data?.role === 'admin')
        setCargando(false)
      })
    return () => {
      vigente = false
    }
  }, [usuarioId])

  return { sesion, esAdmin, cargando }
}
