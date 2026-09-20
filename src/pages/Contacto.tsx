import { useState } from 'react'
import Aviso from '../componentes/base/Aviso'
import Boton from '../componentes/base/Boton'
import Burbuja from '../componentes/base/Burbuja'
import Pagina from '../componentes/layout/Pagina'
import FormularioContacto from '../componentes/soporte/FormularioContacto'

export default function Contacto() {
  const [enviado, setEnviado] = useState(false)

  return (
    <Pagina ancho="lectura">
      <Burbuja tono="blanco" entrada="ninguna" interior="flex flex-col gap-6">
        <div>
          <h1 className="mb-2 text-titulo-m font-light md:text-titulo-l">Contacto</h1>
          <p className="max-w-parrafo text-cuerpo text-mar-tintaSuave">
            Escribinos por una duda, un problema con tu cuenta o para pedir algo sobre tus datos. Te respondemos por email.
          </p>
        </div>

        {enviado ? (
          <div className="flex flex-col items-start gap-5">
            <Aviso tono="info" className="w-full">
              Recibimos tu mensaje. Te respondemos por email en los próximos días.
            </Aviso>
            <Boton to="/" variante="secundario">
              Volver al inicio
            </Boton>
          </div>
        ) : (
          <>
            <Aviso tono="info">
              Este canal no es para urgencias. Si estás atravesando una crisis, buscá ayuda profesional o el servicio de emergencias de tu zona.
            </Aviso>
            <FormularioContacto onEnviado={() => setEnviado(true)} />
          </>
        )}
      </Burbuja>
    </Pagina>
  )
}
