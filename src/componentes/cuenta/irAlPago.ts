import type { NavigateFunction } from 'react-router-dom'
import type { DestinoDePago } from '../../datos/contenido'

// Con Mercado Pago el destino es una URL externa y se sale del sitio; en desarrollo es una pantalla nuestra.
const ANFITRIONES = ['mercadopago.com', 'mercadopago.com.ar']

// Solo se sale del sitio hacia Mercado Pago: si la URL que devolvió el servidor apunta a otro lado, no se sigue.
export function irAlPago(destino: DestinoDePago, navegar: NavigateFunction) {
  if (!destino.externo) return navegar(destino.url)
  const { protocol, hostname } = new URL(destino.url)
  if (protocol !== 'https:' || !ANFITRIONES.some((a) => hostname === a || hostname.endsWith(`.${a}`))) {
    throw new Error('Destino de pago no permitido')
  }
  window.location.assign(destino.url)
}
