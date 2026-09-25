import { useEffect, useState } from 'react'
import { obtenerPrecio } from '../datos/contenido'
import { precio as formatearPrecio } from './formato'

// El precio del plan, formateado ('$15.000') o el placeholder `[PRECIO]` mientras `MP_PRECIO_ARS`
// todavía no está cargado — nunca un número inventado ni desactualizado: mejor mostrar el placeholder
// de siempre que arriesgarse a mostrar uno que ya no coincide con lo que de verdad cobra Mercado Pago.
export function usePrecio(): string {
  const [texto, setTexto] = useState('[PRECIO]')

  useEffect(() => {
    let vivo = true
    void obtenerPrecio().then((ars) => {
      if (vivo && ars) setTexto(formatearPrecio(ars))
    })
    return () => {
      vivo = false
    }
  }, [])

  return texto
}
