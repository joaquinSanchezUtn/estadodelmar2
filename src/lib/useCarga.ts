import { useEffect, useState } from 'react'

// Caché en memoria: volver a una pantalla ya vista la muestra al instante (importa para
// que la ventana pueda cerrarse sobre su burbuja) y se revalida en segundo plano.
const cache = new Map<string, unknown>()

// Se vacía cuando la sesión deja de tener acceso: lo premium que se había cargado no debe
// quedar en memoria en un dispositivo compartido después de cerrar sesión.
export const vaciarCache = () => cache.clear()

// Carga datos asíncronos. `clave` identifica el pedido; cuando cambia, `anteriores` conserva
// lo último cargado para que la pantalla no se vacíe mientras llega lo nuevo.
// Pendiente para cuando entre Supabase: manejar el error de red.
export function useCarga<T>(clave: string, cargar: () => Promise<T>) {
  const [estado, setEstado] = useState<{ clave: string; datos: T } | null>(() =>
    cache.has(clave) ? { clave, datos: cache.get(clave) as T } : null,
  )

  useEffect(() => {
    let vigente = true
    cargar().then((datos) => {
      cache.set(clave, datos)
      if (!vigente) return
      // Si lo revalidado es igual a lo que ya se muestra, se devuelve el mismo estado y React
      // no vuelve a renderizar: un re-render de más en plena transición haría que Motion mida
      // las burbujas en el momento equivocado. La comparación es contra lo que la pantalla
      // ya tiene, no contra el caché (que también lo llena una llamada ya cancelada).
      setEstado((previo) =>
        previo?.clave === clave && JSON.stringify(previo.datos) === JSON.stringify(datos) ? previo : { clave, datos },
      )
    })
    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave])

  const propios = estado?.clave === clave ? estado.datos : ((cache.get(clave) as T | undefined) ?? null)
  return { datos: propios, anteriores: estado?.datos ?? null, cargando: propios === null }
}
