import { useSesion } from '../../auth/SesionContext'
import { obtenerSuscripcion } from '../../datos/contenido'
import { useCarga } from '../../lib/useCarga'
import { usePrecio } from '../../lib/usePrecio'
import type { EstiloId, Pieza } from '../../datos/tipos'
import Boton from '../base/Boton'
import Burbuja from '../base/Burbuja'
import ListaIncluye from '../base/ListaIncluye'
import PiezaBloqueada from './PiezaBloqueada'

type Props = { piezas: Pieza[]; estado: EstiloId | null }

// Las tres piezas que trae todo tema (lo dice la home): para un tema que todavía no tiene ninguna publicada.
const piezasDeCadaTema = [
  { titulo: 'Video psicoeducativo', texto: 'Para entender qué pasa adentro.' },
  { titulo: 'Meditación guiada', texto: 'Para volver a la profundidad.' },
  { titulo: 'Ejercitación', texto: 'Para llevarlo a la vida diaria.' },
]

const textos = {
  'sin-plan': {
    titulo: 'Este tema es para suscriptoras',
    texto: 'Con un solo plan accedés a todos los temas y a los que se vayan sumando. La suscripción se activa desde Mi cuenta.',
  },
  vencida: {
    titulo: 'Tu suscripción venció',
    texto: 'Perdiste el acceso a los temas hasta que la reactives. Podés hacerlo desde Mi cuenta en un momento.',
  },
  pendiente: {
    titulo: 'Estamos esperando tu pago',
    texto: 'Apenas se acredite, este tema se abre solo. Podés ver cómo va desde Mi cuenta.',
  },
}

// Vista sin acceso: las piezas con su duración detrás de un vidrio esmerilado, y una burbuja
// que invita a suscribirse.
export default function ContenidoBloqueado({ piezas, estado }: Props) {
  const { usuario, rol } = useSesion() // para decidir a dónde mandar y qué decir: Mi cuenta o Ingresar
  // Quien tuvo una suscripción y la perdió (o está esperando que se acredite) necesita otro mensaje.
  // Solo se pide con sesión: para un visitante no hay nada que consultar.
  const { datos: suscripcion } = useCarga(`suscripcion:${usuario?.email ?? 'anonimo'}:${rol}`, async () =>
    usuario ? obtenerSuscripcion() : null,
  )
  const precio = usePrecio()
  const motivo = suscripcion?.estado === 'vencida' ? 'vencida' : suscripcion?.estado === 'pendiente' ? 'pendiente' : 'sin-plan'

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      {piezas.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {piezas.map((pieza) => (
            <PiezaBloqueada key={pieza.tipo} pieza={pieza} estado={estado} />
          ))}
        </ul>
      ) : (
        // Un tema publicado sin piezas publicadas todavía: se dice qué va a traer, sin inventar duraciones.
        <section className="rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-6 shadow-suave">
          <h2 className="mb-2 text-titulo-s">Este tema se está preparando</h2>
          <p className="mb-4 text-cuerpo text-mar-tintaSuave">Cuando esté completo, va a traer:</p>
          <ul className="grid gap-3 sm:grid-cols-3">
            {piezasDeCadaTema.map((p) => (
              <li key={p.titulo} className="rounded-tarjeta bg-mar-primarioSuave p-4">
                <p className="font-titulo text-cuerpo font-bold text-mar-tinta">{p.titulo}</p>
                <p className="mt-1 text-meta text-mar-tintaSuave">{p.texto}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Burbuja tono="arena" entrada="ninguna" className="p-6 text-center md:p-8">
        <h2 className="mb-2 text-titulo-m font-normal">{textos[motivo].titulo}</h2>
        <p className="mx-auto mb-5 max-w-angosto text-cuerpo text-mar-tintaSuave">{textos[motivo].texto}</p>
        {motivo === 'sin-plan' && (
          <div className="mx-auto mb-6 flex max-w-angosto flex-col items-center gap-4">
            <p className="font-titulo text-titulo-m text-mar-tinta">
              {precio} <span className="font-sans text-meta text-mar-tintaSuave">por mes</span>
            </p>
            <ListaIncluye />
          </div>
        )}
        <Boton to={usuario ? '/mi-cuenta' : '/ingresar'}>{usuario ? 'Ir a Mi cuenta' : 'Ingresá o creá tu cuenta'}</Boton>
      </Burbuja>
    </div>
  )
}
