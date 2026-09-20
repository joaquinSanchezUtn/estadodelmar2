type Props = { titulo: string; texto?: string }

// Encabezado de una burbuja de la home.
export default function TituloBurbuja({ titulo, texto }: Props) {
  return (
    <div className="mb-6 md:mb-8">
      <h2 className="mb-2 text-titulo-m font-normal md:text-titulo-l">{titulo}</h2>
      {texto && <p className="max-w-parrafo text-cuerpo text-mar-tintaSuave">{texto}</p>}
    </div>
  )
}
