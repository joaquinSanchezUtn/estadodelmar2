import { useState, type FormEvent } from 'react'
import { cambiarDescuentoAdmin, type EstadoDelPrecio } from '../../datos/contenido'
import { precio as formatear } from '../../lib/formato'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import Campo from '../base/Campo'

type Props = { actual: EstadoDelPrecio; onCambiado: (aviso: string) => void }

const primerMes = (precio: number, pct: number) => Math.round((precio * (100 - pct)) / 100)

// El descuento del primer mes (0022): un porcentaje que se prende y se apaga a mano. Vale para quien se suscribe
// por primera vez; desde el segundo mes paga el precio normal. Las suscriptas de antes no cambian.
export default function FormularioDescuento({ actual, onCambiado }: Props) {
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState(actual.descuentoPct?.toString() ?? '')
  const [error, setError] = useState<string | null>(null)
  const [pendiente, setPendiente] = useState(false)
  const pct = Number(texto.replace(/[%\s]/g, ''))
  const valido = Number.isInteger(pct) && pct >= 1 && pct <= 90
  const activo = actual.descuentoPct

  const guardar = async (nuevo: number | null) => {
    setPendiente(true)
    const r = await cambiarDescuentoAdmin(nuevo)
    setPendiente(false)
    if (!r.ok) return setError(r.mensaje)
    setError(null)
    setEditando(false)
    onCambiado(nuevo ? `Listo: quien se suscriba por primera vez paga ${formatear(primerMes(actual.precioArs, nuevo))} el primer mes.` : 'Listo: sacaste el descuento. Desde ahora todas pagan el precio normal.')
  }
  const enviar = (e: FormEvent) => {
    e.preventDefault()
    if (!valido) return setError('Escribí un número del 1 al 90. Por ejemplo: 20.')
    void guardar(pct)
  }

  return (
    <section aria-labelledby="titulo-descuento" className="flex flex-col gap-5 rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-6 shadow-suave md:p-8">
      <div className="flex items-start gap-4">
        <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-mar-arena text-titulo-s">
          🎁
        </span>
        <div>
          <h2 id="titulo-descuento" className="text-titulo-m">
            Descuento para el primer mes
          </h2>
          <p className="text-cuerpo text-mar-tintaSuave">Para quien se suscribe por primera vez. Desde el segundo mes paga el precio normal.</p>
        </div>
      </div>

      {activo && !editando ? (
        <>
          <p className="rounded-tarjeta bg-mar-primarioSuave p-4 text-destacado text-mar-tinta">
            <strong>Está prendido: {activo} % de descuento.</strong> El primer mes cuesta {formatear(primerMes(actual.precioArs, activo))} en vez de {formatear(actual.precioArs)}.
          </p>
          {error && <Aviso>{error}</Aviso>}
          <div className="flex flex-wrap gap-3">
            <Boton variante="secundario" onClick={() => setEditando(true)} disabled={pendiente}>
              Cambiar el porcentaje
            </Boton>
            <Boton variante="fantasma" onClick={() => guardar(null)} disabled={pendiente} aria-busy={pendiente}>
              {pendiente ? 'Sacando…' : 'Quitar el descuento'}
            </Boton>
          </div>
        </>
      ) : (
        <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
          <Campo
            etiqueta="¿Cuánto descuento? (en %)"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Por ejemplo: 20"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            ayuda={valido ? `El primer mes costaría ${formatear(primerMes(actual.precioArs, pct))} en vez de ${formatear(actual.precioArs)}.` : 'Un número del 1 al 90.'}
            error={error ?? undefined}
          />
          <div className="flex flex-wrap gap-3">
            <Boton type="submit" disabled={pendiente} aria-busy={pendiente}>
              {pendiente ? 'Guardando…' : activo ? 'Guardar el porcentaje' : 'Poner el descuento'}
            </Boton>
            {activo && (
              <Boton variante="secundario" onClick={() => setEditando(false)} disabled={pendiente}>
                No, volver
              </Boton>
            )}
          </div>
        </form>
      )}
    </section>
  )
}
