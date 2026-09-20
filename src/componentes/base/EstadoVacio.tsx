import Boton from './Boton'

type Props = {
  titulo: string
  texto?: string
  enlace: { to: string; texto: string }
}

// Pantalla vacía amable: dice qué pasó y ofrece un camino de vuelta.
export default function EstadoVacio({ titulo, texto, enlace }: Props) {
  return (
    <div className="flex flex-col items-start gap-4 py-6">
      <h1 className="text-3xl font-light md:text-4xl">{titulo}</h1>
      {texto && <p className="max-w-md text-base leading-relaxed text-mar-tintaSuave">{texto}</p>}
      <Boton to={enlace.to} variante="secundario">
        {enlace.texto}
      </Boton>
    </div>
  )
}
