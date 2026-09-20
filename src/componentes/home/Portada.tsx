import Boton from '../base/Boton'
import Seccion from '../layout/Seccion'

export default function Portada() {
  return (
    <Seccion
      fondo="degrade"
      className="flex flex-col gap-4 pt-11 md:items-center md:gap-6 md:pb-[76px] md:pt-20 md:text-center"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-mar-agua md:text-[13px]">
        Un gimnasio del alma
      </p>
      <h1 className="text-[40px] font-light leading-[1.14] md:text-[56px] md:leading-[1.12] lg:text-[64px]">
        No somos las olas.
        <br />
        Somos el océano.
      </h1>
      <p className="text-[17px] leading-relaxed text-mar-tintaSuave md:max-w-[660px] md:text-[19px]">
        Las emociones, los pensamientos y las circunstancias aparecen y desaparecen. Debajo de
        todo eso hay un espacio de paz que nunca se va. Acá se practica vivir desde esa
        profundidad.
      </p>
      <div className="mt-2 flex flex-col gap-3 md:flex-row md:gap-3.5">
        <Boton to="/#ventanas">Ver las ventanas</Boton>
        <Boton to="/#propuesta" variante="secundario">
          Cómo funciona
        </Boton>
      </div>
    </Seccion>
  )
}
