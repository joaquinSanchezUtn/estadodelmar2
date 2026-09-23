import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useSesion } from '../auth/SesionContext'
import PaginaDeAcceso from '../componentes/acceso/PaginaDeAcceso'
import Aviso from '../componentes/base/Aviso'
import Boton from '../componentes/base/Boton'
import { irAlPago } from '../componentes/cuenta/irAlPago'
import { iniciarSuscripcion, obtenerEstadoDelPago } from '../datos/contenido'
import type { EstadoDelPago } from '../datos/tipos'
import { useAccion } from '../lib/useAccion'

const INTERVALO_MS = 2000
const INTENTOS = 8

// A donde vuelve la persona desde Mercado Pago. La URL trae el identificador del pago (el
// preapproval_id, que Mercado Pago agrega solo al volver del checkout) y la pantalla le pregunta al
// servidor cómo le fue A ESE pago: lo que ella misma diga no cambia nada. El servidor lo sabe por el
// webhook, que puede tardar unos segundos: por eso se consulta hasta que deje de estar "procesando".
//
// OJO: todavía no se verificó contra una vuelta real de Mercado Pago que el parámetro se llame
// exactamente `preapproval_id` (la documentación pública no lo confirma); revisar en la primera
// suscripción de prueba de punta a punta y ajustar acá si hace falta.
export default function SuscripcionResultado() {
  const id = useSearchParams()[0].get('preapproval_id') ?? ''
  const { refrescarSesion } = useSesion()
  const navegar = useNavigate()
  const [estado, setEstado] = useState<EstadoDelPago>('procesando')
  const [agotado, setAgotado] = useState(false)
  const reintento = useAccion()
  // La función cambia de identidad cada vez que cambia la sesión: no puede ser una dependencia del
  // efecto, o refrescar la sesión lo vuelve a disparar sin fin.
  const refrescar = useRef(refrescarSesion)
  refrescar.current = refrescarSesion

  useEffect(() => {
    if (!id) return
    let vivo = true
    let timer: ReturnType<typeof setTimeout>
    const consultar = async (n: number) => {
      const e = await obtenerEstadoDelPago(id)
      if (!vivo) return
      setEstado(e)
      if (e === 'aprobado') return void refrescar.current() // una sola vez: el acceso cambió
      if (e !== 'procesando') return
      if (n + 1 >= INTENTOS) return setAgotado(true)
      timer = setTimeout(() => consultar(n + 1), INTERVALO_MS)
    }
    consultar(0)
    return () => {
      vivo = false
      clearTimeout(timer)
    }
  }, [id])

  if (!id || estado === 'desconocido') return <Navigate to="/mi-cuenta" replace />

  if (estado === 'aprobado') {
    return (
      <PaginaDeAcceso titulo="Tu suscripción está activa" texto="Ya podés entrar a todas las ventanas. Gracias por sumarte.">
        <div className="flex flex-col gap-3">
          <Boton to="/#ventanas">Ver las ventanas</Boton>
          <Boton to="/mi-cuenta" variante="fantasma">
            Ir a Mi cuenta
          </Boton>
        </div>
      </PaginaDeAcceso>
    )
  }

  if (estado === 'rechazado') {
    return (
      <PaginaDeAcceso titulo="No pudimos cobrar" texto="Mercado Pago no aprobó el pago. No se te cobró nada.">
        <div className="flex flex-col gap-3">
          <Boton
            onClick={() => reintento.ejecutar(async () => (irAlPago(await iniciarSuscripcion(), navegar), null))}
            disabled={reintento.pendiente}
            aria-busy={reintento.pendiente}
          >
            {reintento.pendiente ? 'Te llevamos a Mercado Pago…' : 'Probar con otro medio de pago'}
          </Boton>
          <Boton to="/mi-cuenta" variante="fantasma">
            Volver a Mi cuenta
          </Boton>
          {reintento.error && <Aviso>{reintento.error}</Aviso>}
        </div>
      </PaginaDeAcceso>
    )
  }

  if (estado === 'pendiente') {
    return (
      <PaginaDeAcceso titulo="Estamos esperando tu pago" texto="Todavía no se acreditó. Según el medio que elegiste puede tardar unos días.">
        <Aviso tono="info" className="mb-6">
          Apenas llegue, tu acceso se activa solo y te avisamos por correo. No hace falta que hagas nada más.
        </Aviso>
        <Boton to="/mi-cuenta">Ir a Mi cuenta</Boton>
      </PaginaDeAcceso>
    )
  }

  if (agotado) {
    return (
      <PaginaDeAcceso titulo="Todavía lo estamos confirmando" texto="Está tardando más de lo normal, pero no se perdió nada.">
        <Aviso tono="info" className="mb-6">
          Podés cerrar esta pantalla: apenas Mercado Pago nos confirme, tu acceso se activa solo. También lo ves en Mi cuenta.
        </Aviso>
        <Boton to="/mi-cuenta">Ir a Mi cuenta</Boton>
      </PaginaDeAcceso>
    )
  }

  return (
    <PaginaDeAcceso titulo="Estamos confirmando tu pago" texto="Un momento, no cierres esta pantalla.">
      <p role="status" className="sr-only">
        Confirmando el pago
      </p>
    </PaginaDeAcceso>
  )
}
