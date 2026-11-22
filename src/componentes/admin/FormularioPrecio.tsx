import { useState, type FormEvent } from 'react'
import { cambiarPrecioAdmin, type CambioDePrecio, type EstadoDelPrecio } from '../../datos/contenido'
import { precio as formatear } from '../../lib/formato'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import Campo from '../base/Campo'

type Props = { actual: EstadoDelPrecio; onCambiado: (r: CambioDePrecio) => void }

// Cambiar el precio en dos pasos, para que no se escape un cero: se escribe el número nuevo, se ve
// «antes → ahora» con a quiénes alcanza, y recién ahí se confirma.
export default function FormularioPrecio({ actual, onCambiado }: Props) {
  const [texto, setTexto] = useState('')
  const [revisando, setRevisando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendiente, setPendiente] = useState(false)
  // Se aceptan puntos de miles («12.000»): se sacan antes de leer el número.
  const nuevo = Number(texto.replace(/[.\s$]/g, ''))
  const valido = Number.isInteger(nuevo) && nuevo >= 100 && nuevo <= 10_000_000

  const revisar = (e: FormEvent) => {
    e.preventDefault()
    if (!valido) return setError('Escribí solo el número, en pesos y sin centavos. Por ejemplo: 12000.')
    if (nuevo === actual.precioArs) return setError('Ese ya es el precio de hoy.')
    setError(null)
    setRevisando(true)
  }

  const confirmar = async () => {
    setPendiente(true)
    const r = await cambiarPrecioAdmin(nuevo)
    setPendiente(false)
    if (!r.ok) return setError(r.mensaje)
    setRevisando(false)
    setTexto('')
    onCambiado(r)
  }

  if (revisando) {
    return (
      <section aria-labelledby="titulo-confirmar" className="flex flex-col gap-5 rounded-burbuja border-2 border-mar-primario bg-mar-blanco p-6 shadow-suave md:p-8">
        <h2 id="titulo-confirmar" className="text-titulo-m">
          ¿Cambiamos el precio?
        </h2>
        <p className="flex flex-wrap items-baseline gap-3 font-titulo text-titulo-l">
          <span className="text-mar-tintaSuave line-through">{formatear(actual.precioArs)}</span>
          <span aria-hidden="true">→</span>
          <span className="text-mar-primario">{formatear(nuevo)}</span>
          <span className="font-sans text-cuerpo text-mar-tintaSuave">por mes</span>
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-6 text-destacado text-mar-tinta">
          <li>Desde ahora, quien se suscriba paga {formatear(nuevo)}.</li>
          {actual.suscriptas > 0 ? (
            <li>
              {actual.suscriptas === 1 ? 'La persona que ya está suscripta paga' : `Las ${actual.suscriptas} personas que ya están suscriptas pagan`} el precio nuevo desde su próximo cobro.
            </li>
          ) : (
            <li>Hoy no hay nadie suscripto, así que no le cambia a nadie.</li>
          )}
        </ul>
        {actual.suscriptas > 0 && <Aviso tono="info">Importante: avisales antes por email a tus suscriptoras que el precio cambia. La ley lo pide, y así nadie se sorprende con el cobro.</Aviso>}
        {error && <Aviso>{error}</Aviso>}
        <div className="flex flex-wrap gap-3">
          <Boton onClick={confirmar} disabled={pendiente} aria-busy={pendiente}>
            {pendiente ? 'Cambiando…' : 'Sí, cambiar el precio'}
          </Boton>
          <Boton variante="secundario" onClick={() => setRevisando(false)} disabled={pendiente}>
            No, volver
          </Boton>
        </div>
      </section>
    )
  }

  return (
    <form onSubmit={revisar} noValidate className="flex flex-col gap-5 rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-6 shadow-suave md:p-8">
      <h2 className="text-titulo-m">Cambiar el precio</h2>
      <Campo
        etiqueta="Precio nuevo por mes, en pesos"
        inputMode="numeric"
        autoComplete="off"
        placeholder="Por ejemplo: 12000"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        ayuda={valido ? `Se va a ver así: ${formatear(nuevo)} por mes.` : 'Solo el número, sin centavos.'}
        error={error ?? undefined}
      />
      <div>
        <Boton type="submit">Seguir</Boton>
      </div>
    </form>
  )
}
