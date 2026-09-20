import { Play } from '../../componentes/base/iconos'

// Maqueta de la vista con suscripción, con textos entre corchetes.
// El contenido real llegará de la base; esta vista solo se ve en desarrollo.
export default function ContenidoAbierto() {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="overflow-hidden rounded-[14px] border border-mar-bordeAgua bg-mar-blanco">
        <div className="flex h-[190px] items-center justify-center bg-mar-espuma lg:h-[320px]">
          <span className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-mar-arena text-[#2A3E45]">
            <Play className="h-[22px] w-[22px]" />
          </span>
        </div>
        <div className="p-[18px]">
          <p className="mb-1.5 font-titulo text-[19px]">[Título del video]</p>
          <p className="text-[15px] text-mar-tintaSuave">Video psicoeducativo · [duración]</p>
        </div>
      </div>

      <div className="flex items-center gap-3.5 rounded-[13px] border border-mar-bordeAgua bg-mar-blanco p-[17px]">
        <Play className="h-[22px] w-[22px] shrink-0 text-mar-arenaOscura" />
        <span className="flex flex-col gap-1">
          <span className="font-titulo text-lg">Meditación guiada</span>
          <span className="text-[15px] text-mar-tintaSuave">[Título] · [duración]</span>
        </span>
      </div>

      <div className="rounded-[13px] border border-mar-bordeAgua bg-mar-blanco p-5">
        <p className="mb-2.5 font-titulo text-lg">Ejercitación</p>
        <p className="text-base leading-relaxed text-mar-tinta">[Consigna de la ejercitación]</p>
      </div>
    </div>
  )
}
