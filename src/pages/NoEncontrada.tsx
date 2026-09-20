import EstadoVacio from '../componentes/base/EstadoVacio'
import Seccion from '../componentes/layout/Seccion'

export default function NoEncontrada() {
  return (
    <Seccion fondo="marfil" angosta className="min-h-[50vh]">
      <EstadoVacio
        titulo="Esta página no existe"
        texto="Puede que el enlace esté mal escrito o que la página se haya movido."
        enlace={{ to: '/', texto: 'Volver al inicio' }}
      />
    </Seccion>
  )
}
