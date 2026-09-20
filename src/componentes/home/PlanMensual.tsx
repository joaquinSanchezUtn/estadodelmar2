import { Link } from 'react-router-dom'
import { useSesion } from '../../auth/SesionContext'
import Boton from '../base/Boton'
import Burbuja from '../base/Burbuja'
import Tarjeta from '../base/Tarjeta'
import { Check } from '../base/iconos'
import Burbujitas from '../objetos/Burbujitas'
import Manchas from '../objetos/Manchas'

const incluye = [
  'Videos psicoeducativos de cada tema',
  'Meditaciones guiadas',
  'Una ejercitación práctica por cada malestar',
]

export default function PlanMensual() {
  const { accesoActivo, usuario } = useSesion()

  return (
    <Burbuja
      id="suscripcion"
      tono="espuma"
      decoracion={
        <>
          <Manchas cantidad={2} />
          <Burbujitas />
        </>
      }
      interior="flex flex-col gap-8 md:gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-14"
    >
      <div className="lg:max-w-parrafo">
        <h2 className="mb-4 text-titulo-m font-normal md:text-titulo-l">Una suscripción, todo adentro</h2>
        <p className="mb-5 text-cuerpo text-mar-tintaSuave">
          Acceso completo a todas las ventanas y a las que se vayan sumando. Sin permanencia: te das de
          baja cuando quieras, desde tu cuenta, y seguís teniendo acceso hasta que termine el mes pago.
        </p>
        <ul className="flex flex-col gap-3 text-cuerpo text-mar-tinta">
          {incluye.map((texto) => (
            <li key={texto} className="flex items-center gap-3">
              <Check className="size-5 shrink-0 text-mar-agua" />
              {texto}
            </li>
          ))}
        </ul>
      </div>

      <Tarjeta className="p-6 text-center md:mx-auto md:w-full md:max-w-angosto lg:mx-0 lg:w-96 lg:shrink-0 lg:p-8">
        <p className="mb-4 text-etiqueta uppercase text-mar-agua">Plan mensual</p>
        <p className="font-titulo text-titulo-xl font-light">[PRECIO]</p>
        <p className="mb-6 mt-2 text-meta text-mar-tintaSuave">por mes · se renueva solo</p>
        {accesoActivo ? (
          <Boton to="/mi-cuenta" variante="secundario" className="w-full">
            Ya tenés acceso · Mi cuenta
          </Boton>
        ) : (
          <>
            <p className="text-cuerpo text-mar-tintaSuave">
              Ingresá o creá tu cuenta: el plan se activa desde Mi cuenta.
            </p>
            <Link to={usuario ? '/mi-cuenta' : '/ingresar'} className="inline-flex min-h-control-sm items-center underline">
              {usuario ? 'Ir a Mi cuenta' : 'Ingresar'}
            </Link>
          </>
        )}
        <p className="mt-4 text-meta text-mar-tintaSuave">
          Pago con Mercado Pago. Cancelás cuando quieras.
        </p>
      </Tarjeta>
    </Burbuja>
  )
}
