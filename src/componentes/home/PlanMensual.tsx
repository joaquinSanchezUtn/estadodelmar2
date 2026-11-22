import { Link } from 'react-router-dom'
import { useSesion } from '../../auth/SesionContext'
import { usePlan } from '../../lib/usePrecio'
import PrecioDelPlan from '../base/PrecioDelPlan'
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
  const plan = usePlan()

  return (
    <section id="suscripcion" className="grid scroll-mt-24 items-center gap-8 py-6 md:py-10 lg:grid-cols-2 lg:gap-14">
      <div>
        <p className="mb-4 inline-block rounded-full bg-mar-primarioSuave px-4 py-1 text-meta font-bold text-mar-primario">Un solo plan</p>
        <h2 className="mb-4 text-titulo-m md:text-titulo-l">Una suscripción, todo adentro</h2>
        <p className="mb-5 text-cuerpo text-mar-tintaSuave">
          Acceso completo a todos los temas y a los que se vayan sumando. Sin permanencia: te das de
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

      <div className="relative overflow-hidden rounded-burbujaGrande border-2 border-mar-primario bg-mar-blanco text-center shadow-alzada">
        {/* La cabecera de la tarjeta: un pedacito de mar, con dos olas que separan el precio del resto. */}
        <div aria-hidden="true" className="relative h-24 bg-gradient-to-b from-mar-aguaClara to-mar-espuma">
          <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-10 w-full">
            <path d="M0 22 C 60 6, 120 34, 200 20 S 330 6, 400 20 L400 40 L0 40 Z" className="fill-mar-nube" />
            <path d="M0 30 C 70 18, 140 40, 210 28 S 340 18, 400 30 L400 40 L0 40 Z" className="fill-mar-blanco" />
          </svg>
          <p className="relative pt-6 text-etiqueta uppercase text-mar-primario">Plan mensual</p>
        </div>
        <div className="px-6 pb-6 md:px-10 md:pb-10">
          <PrecioDelPlan plan={plan} className="mb-2" />
          <p className="mb-6 text-meta text-mar-tintaSuave">Se renueva solo · cancelás cuando quieras</p>
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
          {plan.descuento && !accesoActivo && <p className="mt-3 text-meta text-mar-tintaSuave">El descuento es para quien se suscribe por primera vez.</p>}
          <p className="mt-5 flex items-center justify-center gap-2 border-t border-mar-bordeAgua pt-4 text-meta text-mar-tintaSuave">
            <span aria-hidden="true">🔒</span> Pago seguro con Mercado Pago
          </p>
        </div>
      </div>
    </section>
  )
}
