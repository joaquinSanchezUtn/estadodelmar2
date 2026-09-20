import { useEffect, useState, useSyncExternalStore } from 'react'

// Caché en memoria: volver a una pantalla ya vista la muestra al instante (importa para
// que la ventana pueda cerrarse sobre su burbuja) y se revalida en segundo plano.
//
// Hay dos memorias. La PÚBLICA (estados, catálogo) no depende de quién sos. La PRIVADA
// puede tener datos premium: se vacía en cada cambio de sesión, y también se invalidan
// los datos que ya están en pantalla y los pedidos en vuelo (una "generación" nueva).
const privada = new Map<string, unknown>()
const publica = new Map<string, unknown>()
let generacion = 0
const oyentes = new Set<() => void>()

// Se llama en cada cambio de sesión (cierre, cambio de rol, suscripción vencida): lo premium
// que se había cargado no debe quedar en memoria ni mostrarse, en un dispositivo compartido
// tampoco, y ningún pedido hecho con la sesión anterior puede volver a llenar el caché.
export function vaciarCache() {
  privada.clear()
  generacion++
  oyentes.forEach((avisar) => avisar())
}

const suscribir = (avisar: () => void) => {
  oyentes.add(avisar)
  return () => oyentes.delete(avisar)
}

// Carga datos asíncronos. `clave` identifica el pedido; `esPublica` marca lo que no depende
// de la sesión. Pendiente para cuando entre Supabase: manejar el error de red.
export function useCarga<T>(clave: string, cargar: () => Promise<T>, esPublica = false) {
  const memoria = esPublica ? publica : privada
  const actual = useSyncExternalStore(suscribir, () => generacion)
  const gen = esPublica ? 0 : actual

  const [estado, setEstado] = useState<{ clave: string; gen: number; datos: T } | null>(() =>
    memoria.has(clave) ? { clave, gen, datos: memoria.get(clave) as T } : null,
  )

  useEffect(() => {
    let vigente = true
    cargar().then((datos) => {
      // Un pedido hecho con la sesión anterior se descarta: cambiar de generación vuelve
      // a correr este efecto, que lo deja "no vigente".
      if (!vigente) return
      memoria.set(clave, datos)
      // Si lo revalidado es igual a lo que ya se muestra, se devuelve el mismo estado y React
      // no vuelve a renderizar: un re-render de más en plena transición haría que Motion mida
      // las burbujas en el momento equivocado.
      setEstado((previo) =>
        previo?.clave === clave && previo.gen === gen && JSON.stringify(previo.datos) === JSON.stringify(datos)
          ? previo
          : { clave, gen, datos },
      )
    })
    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, gen])

  // Lo cargado con una sesión anterior se suelta de inmediato de la memoria de React.
  useEffect(() => {
    setEstado((previo) => (previo && previo.gen !== gen ? null : previo))
  }, [gen])

  const propios = estado?.clave === clave && estado.gen === gen ? estado.datos : ((memoria.get(clave) as T | undefined) ?? null)
  return { datos: propios, cargando: propios === null }
}
