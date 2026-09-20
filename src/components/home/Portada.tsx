import Boton from '../Boton'
import Seccion from '../Seccion'

export default function Portada() {
  return (
    <Seccion
      fondo="degrade"
      className="flex flex-col gap-4 pt-11 lg:items-center lg:gap-6 lg:pb-[76px] lg:pt-20 lg:text-center"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-mar-agua lg:text-[13px]">
        Un gimnasio del alma
      </p>
      <h1 className="text-[40px] font-light leading-[1.14] lg:text-[64px] lg:leading-[1.12]">
        No somos las olas.
        <br />
        Somos el océano.
      </h1>
      <p className="text-[17px] leading-relaxed text-mar-tintaSuave lg:max-w-[660px] lg:text-[19px]">
        Las emociones, los pensamientos y las circunstancias aparecen y desaparecen. Debajo de
        todo eso hay un espacio de paz que nunca se va. Acá se practica vivir desde esa
        profundidad.
      </p>
      <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:gap-3.5">
        <Boton to="/#ventanas">Ver las ventanas</Boton>
        <Boton to="/ingresar" variante="secundario">
          Ingresar
        </Boton>
      </div>
    </Seccion>
  )
}
