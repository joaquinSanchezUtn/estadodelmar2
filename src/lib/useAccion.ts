import { useRef, useState } from 'react'

// Para un botón que dispara una acción: dice si está en curso y guarda el mensaje si falló.
// La acción devuelve el mensaje de error, o null si salió bien. Un segundo disparo mientras la
// primera sigue en curso (doble clic, Enter sostenido) se ignora: pedir dos veces una baja o un
// borrado no puede convertir un éxito en un error.
export function useAccion() {
  const [pendiente, setPendiente] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const enCurso = useRef(false)

  const ejecutar = async (accion: () => Promise<string | null>) => {
    if (enCurso.current) return false
    enCurso.current = true
    setPendiente(true)
    setError(null)
    const mensaje = await accion().catch(() => 'No pudimos hacerlo ahora. Probá de nuevo en un rato.')
    enCurso.current = false
    setPendiente(false)
    if (mensaje) setError(mensaje)
    return !mensaje
  }

  return { pendiente, error, ejecutar }
}
