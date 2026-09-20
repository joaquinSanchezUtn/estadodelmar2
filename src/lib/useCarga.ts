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
  publica.clear() // el catálogo también: lo que vio una sesión (o lo que cambió el panel) no se reutiliza
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

  const [fallo, setFallo] = useState<{ clave: string; gen: number } | null>(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let vigente = true
    cargar().then((datos) => {
      // Un pedido hecho con la sesión anterior se descarta: cambiar de generación vuelve
      // a correr este efecto, que lo deja "no vigente".
      // `vigente` se apaga recién en el commit siguiente al cambio de sesión: en esa ventana un
      // pedido de la sesión anterior aún pasaría. La generación se compara contra la de ahora.
      if (!vigente || (!esPublica && gen !== generacion)) return
      memoria.set(clave, datos)
      // Si lo revalidado es igual a lo que ya se muestra, se devuelve el mismo estado y React
      // no vuelve a renderizar: un re-render de más en plena transición haría que Motion mida
      // las burbujas en el momento equivocado.
      setEstado((previo) =>
        previo?.clave === clave && previo.gen === gen && JSON.stringify(previo.datos) === JSON.stringify(datos)
          ? previo
          : { clave, gen, datos },
      )
    }).catch(() => {
      // Un pedido que falla no puede dejar la pantalla "cargando" para siempre (por ejemplo, sin poder
      // llegar a dar de baja una suscripción): se marca el error y la pantalla ofrece reintentar.
      if (vigente) setFallo({ clave, gen })
    })
    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, gen, intento])

  // Lo cargado con una sesión anterior se suelta de inmediato de la memoria de React.
  useEffect(() => {
    setEstado((previo) => (previo && previo.gen !== gen ? null : previo))
  }, [gen])

  // Un resultado `null` (por ejemplo, "no tiene suscripción") es una respuesta, no una carga
  // pendiente: por eso `cargando` mira si hay respuesta y no si el dato es null.
  const mostrado = estado?.clave === clave && estado.gen === gen
  const enMemoria = memoria.has(clave)
  const datos = mostrado ? estado.datos : enMemoria ? (memoria.get(clave) as T) : null
  const error = !mostrado && !enMemoria && fallo?.clave === clave && fallo.gen === gen
  return {
    datos,
    cargando: !mostrado && !enMemoria && !error,
    error,
    reintentar: () => {
      setFallo(null)
      setIntento((n) => n + 1)
    },
  }
}
