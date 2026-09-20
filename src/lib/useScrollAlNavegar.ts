import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Al navegar baja al ancla (#ventanas) si la hay; si no, vuelve arriba.
export function useScrollAlNavegar() {
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    const destino = hash ? document.getElementById(hash.slice(1)) : null
    if (destino) destino.scrollIntoView()
    else window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash, key])
}
