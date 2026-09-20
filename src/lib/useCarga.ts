import { useEffect, useState } from 'react'

// Carga datos asíncronos y vuelve a pedirlos cuando cambian las dependencias.
// Pendiente para cuando entre Supabase: manejar el error de red.
export function useCarga<T>(cargar: () => Promise<T>, dependencias: unknown[]) {
  const [datos, setDatos] = useState<T | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let vigente = true
    setCargando(true)
    cargar().then((resultado) => {
      if (!vigente) return
      setDatos(resultado)
      setCargando(false)
    })
    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias)

  return { datos, cargando }
}
