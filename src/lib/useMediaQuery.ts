import { useSyncExternalStore } from 'react'

export function useMediaQuery(consulta: string) {
  return useSyncExternalStore(
    (avisar) => {
      const medio = window.matchMedia(consulta)
      medio.addEventListener('change', avisar)
      return () => medio.removeEventListener('change', avisar)
    },
    () => window.matchMedia(consulta).matches,
    () => false,
  )
}
