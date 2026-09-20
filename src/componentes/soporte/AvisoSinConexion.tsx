import { useSyncExternalStore } from 'react'

const suscribir = (avisar: () => void) => {
  window.addEventListener('online', avisar)
  window.addEventListener('offline', avisar)
  return () => {
    window.removeEventListener('online', avisar)
    window.removeEventListener('offline', avisar)
  }
}

// Una franja arriba de todo cuando el navegador se queda sin internet: explica por qué algo no carga.
export default function AvisoSinConexion() {
  const enLinea = useSyncExternalStore(suscribir, () => navigator.onLine, () => true)
  if (enLinea) return null

  return (
    <p role="status" className="border-b border-mar-bordeCielo bg-mar-blanco px-4 py-3 text-center text-cuerpo text-mar-tinta">
      Estás sin conexión. Algunas cosas pueden no cargar hasta que vuelva internet.
    </p>
  )
}
