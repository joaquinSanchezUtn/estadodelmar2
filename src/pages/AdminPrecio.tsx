import { useState } from 'react'
import FormularioPrecio from '../componentes/admin/FormularioPrecio'
import MarcoAdmin from '../componentes/admin/MarcoAdmin'
import Aviso from '../componentes/base/Aviso'
import Boton from '../componentes/base/Boton'
import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import Esqueleto from '../componentes/base/Esqueleto'
import { consultarPrecioAdmin, reaplicarPrecioAdmin, type CambioDePrecio } from '../datos/contenido'
import { precio as formatear } from '../lib/formato'
import { useCarga } from '../lib/useCarga'

const migas = [{ texto: 'Panel', to: '/admin' }, { texto: 'Precio de la suscripción' }]

// El precio del plan mensual: el de hoy, grande, y el formulario para cambiarlo. El cambio vale para quien se
// suscriba desde ahora y para quienes ya están suscriptas, desde su próximo cobro (`cambiar-precio`).
export default function AdminPrecio() {
  const { datos, cargando, error, reintentar } = useCarga('admin:precio', consultarPrecioAdmin)
  const [aviso, setAviso] = useState<{ tono: 'info' | 'error'; texto: string; reintentar?: boolean } | null>(null)
  const [reintentando, setReintentando] = useState(false)

  const resultado = (r: CambioDePrecio) => {
    if (!r.ok) setAviso({ tono: 'error', texto: r.mensaje })
    else if (r.fallidas === 0) setAviso({ tono: 'info', texto: `Listo: el precio ahora es ${formatear(r.precioArs)} por mes.` })
    else
      setAviso({
        tono: 'error',
        texto: `El precio ya es ${formatear(r.precioArs)} para quien se suscriba desde ahora, pero Mercado Pago no nos dejó cambiarlo en ${r.fallidas === 1 ? '1 suscripción' : `${r.fallidas} suscripciones`}. Probá de nuevo en un rato; si sigue pasando, avisale a Joaquin.`,
        reintentar: true,
      })
    reintentar()
  }
  const otraVez = async () => {
    setReintentando(true)
    resultado(await reaplicarPrecioAdmin())
    setReintentando(false)
  }

  return (
    <MarcoAdmin titulo="Precio de la suscripción" migas={migas}>
      {error ? (
        <ErrorDeCarga texto="No pudimos leer el precio." onReintentar={reintentar} />
      ) : cargando || !datos ? (
        <div role="status">
          <p className="sr-only">Cargando el precio…</p>
          <Esqueleto className="h-64" />
        </div>
      ) : (
        <>
          <section className="flex flex-col gap-2 rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-6 shadow-suave md:p-8">
            <p className="text-destacado text-mar-tintaSuave">Hoy la suscripción cuesta</p>
            <p className="font-titulo text-titulo-xl text-mar-tinta">
              {formatear(datos.precioArs)} <span className="font-sans text-destacado text-mar-tintaSuave">por mes</span>
            </p>
            <p className="text-cuerpo text-mar-tintaSuave">
              Es el precio que se ve en el sitio y el que cobra Mercado Pago.{' '}
              {datos.suscriptas === 0 ? 'Hoy no hay nadie suscripto.' : `Hoy ${datos.suscriptas === 1 ? 'hay 1 persona suscripta' : `hay ${datos.suscriptas} personas suscriptas`}.`}
            </p>
          </section>
          {aviso && (
            <Aviso tono={aviso.tono}>
              {aviso.texto}
              {aviso.reintentar && (
                <span className="mt-3 block">
                  <Boton compacto onClick={otraVez} disabled={reintentando} aria-busy={reintentando}>
                    {reintentando ? 'Probando…' : 'Reintentar'}
                  </Boton>
                </span>
              )}
            </Aviso>
          )}
          <FormularioPrecio actual={datos} onCambiado={resultado} />
        </>
      )}
    </MarcoAdmin>
  )
}
