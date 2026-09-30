import { Link } from 'react-router-dom'
import { useSesion } from '../../auth/SesionContext'
import { usePrecio } from '../../lib/usePrecio'
import Boton from '../base/Boton'
import { Check } from '../base/iconos'

const incluye = [
  'Videos psicoeducativos de cada tema',
  'Meditaciones guiadas',
  'Una ejercitación práctica por cada malestar',
  'Desde el celular, la tablet o la compu',
]

export default function PlanMensual() {
  const { accesoActivo, usuario } = useSesion()
  const precio = usePrecio()

  return (
    <section id="suscripcion" className="grid scroll-mt-24 items-center gap-8 py-6 md:py-10 lg:grid-cols-2 lg:gap-14">
      <div>
        <p className="mb-4 inline-block rounded-full bg-mar-primarioSuave px-4 py-1 text-meta font-bold text-mar-primario">Un solo plan</p>
        <h2 className="mb-4 text-titulo-m md:text-titulo-l">Una suscripción, todo adentro</h2>
        <p className="mb-5 text-cuerpo text-mar-tintaSuave">
          Acceso completo a todas las ventanas y a las que se vayan sumando. Sin permanencia: te das de
          baja cuando quieras, desde tu cuenta, y seguís teniendo acceso hasta que termine el mes pago.
        </p>
        <ul className="flex flex-col gap-3 text-cuerpo font-medium text-mar-tinta">
          {incluye.map((texto) => (
            <li key={texto} className="flex items-center gap-3">
              <Check className="size-5 shrink-0 text-mar-primario" />
              {texto}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-burbujaGrande border-2 border-mar-primario bg-mar-blanco p-6 text-center shadow-alzada md:p-10">
        <p className="mb-4 text-etiqueta uppercase text-mar-atardecerTexto">Plan mensual</p>
        <p className="font-titulo text-titulo-xl">{precio}</p>
        <p className="mb-6 mt-2 text-meta text-mar-tintaSuave">por mes · se renueva solo</p>
        {accesoActivo ? (
          <Boton to="/mi-cuenta" variante="secundario" className="w-full">
            Ya tenés acceso · Mi cuenta
          </Boton>
        ) : (
          <>
            <Boton to={usuario ? '/mi-cuenta' : '/registrarme'} className="w-full">
              {usuario ? 'Suscribirme' : 'Crear mi cuenta'}
            </Boton>
            <p className="mt-3 text-meta text-mar-tintaSuave">
              {usuario ? 'El plan se activa desde Mi cuenta.' : (
                <>
                  ¿Ya tenés cuenta? <Link to="/ingresar">Ingresá</Link> y activá el plan desde Mi cuenta.
                </>
              )}
            </p>
          </>
        )}
        <p className="mt-4 text-meta text-mar-tintaSuave">
          Pago seguro con Mercado Pago. Cancelás cuando quieras.
        </p>
      </div>
    </section>
  )
}
