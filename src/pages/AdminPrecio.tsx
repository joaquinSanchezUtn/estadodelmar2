import { useState } from 'react'
import FormularioDescuento from '../componentes/admin/FormularioDescuento'
import FormularioPrecio from '../componentes/admin/FormularioPrecio'
import MarcoAdmin from '../componentes/admin/MarcoAdmin'
import Aviso from '../componentes/base/Aviso'
import Boton from '../componentes/base/Boton'
import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import Esqueleto from '../componentes/base/Esqueleto'
import PrecioDelPlan from '../componentes/base/PrecioDelPlan'
import { consultarPrecioAdmin, reaplicarPrecioAdmin, type CambioDePrecio } from '../datos/contenido'
import { precio as formatear } from '../lib/formato'
import { useCarga } from '../lib/useCarga'
import { olvidarPlan } from '../lib/usePrecio'

const migas = [{ texto: 'Panel', to: '/admin' }, { texto: 'Precio de la suscripción' }]

// El precio del plan mensual: arriba, cómo se ve hoy en la página (con el descuento, si hay); abajo, una tarjeta
// para cambiar el precio (vale para todas, desde su próximo cobro) y otra para el descuento del primer mes.
export default function AdminPrecio() {
  const { datos, cargando, error, reintentar } = useCarga('admin:precio', consultarPrecioAdmin)
  const [aviso, setAviso] = useState<{ tono: 'info' | 'error'; texto: string; reintentar?: boolean } | null>(null)
  const [reintentando, setReintentando] = useState(false)

  const resultado = (r: CambioDePrecio) => {
    olvidarPlan()
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
          <section className="grid items-center gap-6 rounded-burbujaGrande border border-mar-bordeAgua bg-gradient-to-br from-mar-arena via-mar-nube to-mar-aguaClara p-6 shadow-suave md:grid-cols-2 md:p-10">
            <div className="flex flex-col gap-3">
              <p className="text-etiqueta uppercase text-mar-atardecerTexto">Así se ve hoy en la página</p>
              <p className="text-destacado text-mar-tinta">Es el precio que ven las visitantes y el que cobra Mercado Pago.</p>
              <p className="text-cuerpo text-mar-tintaSuave">
                {datos.suscriptas === 0 ? 'Todavía no hay nadie suscripto.' : `Hoy ${datos.suscriptas === 1 ? 'hay 1 persona suscripta' : `hay ${datos.suscriptas} personas suscriptas`}.`}
              </p>
            </div>
            <div className="rounded-burbuja border-2 border-mar-primario bg-mar-blanco p-6 text-center shadow-alzada">
              <p className="mb-3 text-etiqueta uppercase text-mar-primario">Plan mensual</p>
              <PrecioDelPlan
                plan={{
                  precio: formatear(datos.precioArs),
                  descuento: datos.descuentoPct ? { pct: datos.descuentoPct, primerMes: formatear(Math.round((datos.precioArs * (100 - datos.descuentoPct)) / 100)) } : null,
                }}
              />
            </div>
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
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <FormularioPrecio actual={datos} onCambiado={resultado} />
            <FormularioDescuento
              key={datos.descuentoPct ?? 'sin'}
              actual={datos}
              onCambiado={(texto) => {
                olvidarPlan()
                setAviso({ tono: 'info', texto })
                reintentar()
              }}
            />
          </div>
        </>
      )}
    </MarcoAdmin>
  )
}
