type Props = { titulo: string; texto?: string }

export default function TituloSeccion({ titulo, texto }: Props) {
  return (
    <div className="mb-5 lg:mb-8">
      <h2 className="mb-1.5 text-[27px] font-normal lg:mb-2 lg:text-[34px]">{titulo}</h2>
      {texto && (
        <p className="max-w-[700px] text-base leading-relaxed text-mar-tintaSuave">{texto}</p>
      )}
    </div>
  )
}
