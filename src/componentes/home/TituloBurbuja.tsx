type Props = { titulo: string; texto?: string }

// Encabezado de una burbuja de la home.
export default function TituloBurbuja({ titulo, texto }: Props) {
  return (
    <div className="mb-6 md:mb-8">
      <h2 className="mb-1.5 text-[27px] font-normal md:mb-2 lg:text-[34px]">{titulo}</h2>
      {texto && <p className="max-w-[700px] text-base leading-relaxed text-mar-tintaSuave">{texto}</p>}
    </div>
  )
}
