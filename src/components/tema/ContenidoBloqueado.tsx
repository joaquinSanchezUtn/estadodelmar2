import Boton from '../../componentes/base/Boton'
import { IconoCandado } from '../../componentes/base/iconos'

// Vista sin suscripción. Los títulos de video, meditación y ejercitación son
// premium (la base no los entrega), así que acá van solo etiquetas genéricas.
export default function ContenidoBloqueado() {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="overflow-hidden rounded-[14px] border border-mar-bordeAgua bg-mar-blanco">
        <div className="flex h-[190px] flex-col items-center justify-center gap-3 bg-mar-espuma text-mar-tintaSuave">
          <IconoCandado className="h-8 w-8 text-mar-aguaSuave" />
          <span className="text-[15px]">Video psicoeducativo</span>
        </div>
        <p className="p-[18px] text-[15px] text-mar-tintaSuave">Disponible con la suscripción.</p>
      </div>

      {['Meditación guiada', 'Ejercitación'].map((titulo) => (
        <div
          key={titulo}
          className="flex items-center gap-3.5 rounded-[13px] border border-mar-bordeAgua bg-mar-blanco p-[17px]"
        >
          <IconoCandado className="h-[22px] w-[22px] shrink-0 text-mar-aguaSuave" />
          <span className="font-titulo text-lg">{titulo}</span>
        </div>
      ))}

      <div className="mt-2 rounded-2xl border border-mar-bordeArena bg-mar-arenaClara p-6 text-center">
        <h2 className="mb-2 text-[22px] font-normal">Esta ventana es para suscriptoras</h2>
        <p className="mb-5 text-base leading-relaxed text-mar-tintaSuave">
          Con un solo plan accedés a todas las ventanas y a las que se vayan sumando.
        </p>
        <Boton to="/#suscripcion" className="w-full">
          Suscribirme
        </Boton>
        <Boton to="/ingresar" variante="fantasma" className="mt-2 w-full">
          Ya tengo cuenta
        </Boton>
      </div>
    </div>
  )
}
