import Boton from '../../componentes/base/Boton'
import { Check } from '../../componentes/base/iconos'
import Seccion from '../Seccion'

const incluye = [
  'Videos psicoeducativos de cada tema',
  'Meditaciones guiadas',
  'Una ejercitación práctica por cada malestar',
]

export default function PlanMensual() {
  return (
    <Seccion
      id="suscripcion"
      fondo="espuma"
      className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-14"
    >
      <div className="lg:max-w-[560px]">
        <h2 className="mb-3.5 text-[27px] font-normal lg:text-[34px]">
          Una suscripción, todo adentro
        </h2>
        <p className="mb-5 text-base leading-relaxed text-mar-tintaSuave lg:text-[17px]">
          Acceso completo a todas las ventanas y a las que se vayan sumando. Sin permanencia: te
          das de baja cuando quieras, desde tu cuenta, y seguís teniendo acceso hasta que termine
          el mes pago.
        </p>
        <ul className="flex flex-col gap-2.5 text-base text-mar-tinta">
          {incluye.map((texto) => (
            <li key={texto} className="flex items-center gap-2.5">
              <Check className="h-[18px] w-[18px] shrink-0 text-mar-agua" />
              {texto}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-mar-bordeAgua bg-mar-blanco p-6 text-center lg:w-[350px] lg:shrink-0 lg:p-8">
        <p className="mb-3.5 text-xs uppercase tracking-[0.16em] text-mar-agua lg:text-[13px]">
          Plan mensual
        </p>
        <p className="font-titulo text-[44px] font-light leading-none lg:text-[52px]">[PRECIO]</p>
        <p className="mb-6 mt-2 text-sm text-mar-tintaSuave">por mes · se renueva solo</p>
        <Boton to="/ingresar" className="w-full">
          Suscribirme
        </Boton>
        <p className="mt-3.5 text-sm leading-normal text-mar-tintaSuave">
          Pago con Mercado Pago. Cancelás cuando quieras.
        </p>
      </div>
    </Seccion>
  )
}
