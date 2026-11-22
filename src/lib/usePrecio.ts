import { useEffect, useState } from 'react'
import { obtenerPlan } from '../datos/contenido'
import { precio as formatear } from './formato'

// El plan, formateado: el precio normal ('$9.999') o el placeholder `[PRECIO]` mientras no se pudo leer (nunca
// un número inventado), y el descuento del primer mes si está prendido. Se pide una vez por carga de página y
// se comparte entre todas las pantallas que lo muestran.
export type Plan = { precio: string; descuento: { pct: number; primerMes: string } | null }

let pedido: ReturnType<typeof obtenerPlan> | null = null
const inicial: Plan = { precio: '[PRECIO]', descuento: null }

// Después de que la dueña cambia el precio o el descuento, para que el resto del sitio lo vuelva a pedir.
export const olvidarPlan = () => {
  pedido = null
}

export function usePlan(): Plan {
  const [plan, setPlan] = useState<Plan>(inicial)

  useEffect(() => {
    let vivo = true
    pedido ??= obtenerPlan().catch(() => {
      pedido = null
      return { precioArs: null, descuentoPct: null, primerMesArs: null }
    })
    void pedido.then((p) => {
      if (!vivo || !p.precioArs) return
      setPlan({
        precio: formatear(p.precioArs),
        descuento: p.descuentoPct && p.primerMesArs ? { pct: p.descuentoPct, primerMes: formatear(p.primerMesArs) } : null,
      })
    })
    return () => {
      vivo = false
    }
  }, [])

  return plan
}

// Solo el precio normal, para las pantallas donde el descuento no corresponde (quien ya está suscripta, Términos).
export const usePrecio = () => usePlan().precio
