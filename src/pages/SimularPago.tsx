// SOLO DESARROLLO — reemplaza a la pantalla de pago de Mercado Pago, que es externa. En producción
// esta ruta no existe. Permite recorrer cada resultado (aprobado, pendiente, rechazado) sin cobrar nada.
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSesion } from '../auth/SesionContext'
import PaginaDeAcceso from '../componentes/acceso/PaginaDeAcceso'
import Boton from '../componentes/base/Boton'
import { enDias, fijarSuscripcionSimulada, resolverPago, suscripcionSimulada, type ResultadoDePago } from '../datos/suscripcionSimulada'

export default function SimularPago() {
  const [params] = useSearchParams()
  const navegar = useNavigate()
  const { refrescarSesion } = useSesion()
  const cambiaTarjeta = params.get('accion') === 'tarjeta'
  const pago = params.get('pago') ?? ''

  const pagar = (resultado: ResultadoDePago) => {
    resolverPago(pago, resultado)
    navegar(`/suscripcion/resultado?pago=${encodeURIComponent(pago)}`)
  }

  const guardarTarjeta = async () => {
    const s = suscripcionSimulada()
    // Con una tarjeta nueva, una suscripción vencida se reintenta y vuelve a estar activa.
    if (s?.estado === 'activa') fijarSuscripcionSimulada({ ...s, medioDePago: 'Mastercard terminada en 5100' })
    if (s?.estado === 'vencida') {
      fijarSuscripcionSimulada({ estado: 'activa', proximoCobro: enDias(30), medioDePago: 'Mastercard terminada en 5100' })
    }
    await refrescarSesion()
    navegar('/mi-cuenta', { state: { aviso: 'tarjeta' } })
  }

  return (
    <PaginaDeAcceso
      titulo={cambiaTarjeta ? 'Mercado Pago · medio de pago' : 'Mercado Pago · suscripción'}
      texto="Pantalla de simulación (solo desarrollo). Acá Mercado Pago pediría los datos de la tarjeta; no se cobra nada."
    >
      <div className="flex flex-col gap-3">
        {cambiaTarjeta ? (
          <Boton onClick={guardarTarjeta}>Guardar la tarjeta nueva</Boton>
        ) : (
          <>
            <Boton onClick={() => pagar('aprobado')}>Aprobar el pago</Boton>
            <Boton variante="secundario" onClick={() => pagar('pendiente')}>
              Dejarlo pendiente (efectivo)
            </Boton>
            <Boton variante="secundario" onClick={() => pagar('rechazado')}>
              Rechazar el pago
            </Boton>
          </>
        )}
        <Boton to="/mi-cuenta" variante="fantasma">
          Volver sin pagar
        </Boton>
      </div>
    </PaginaDeAcceso>
  )
}
