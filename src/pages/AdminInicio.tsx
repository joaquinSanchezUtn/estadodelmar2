import { useSesion } from '../auth/SesionContext'
import MarcoAdmin from '../componentes/admin/MarcoAdmin'
import PuertasDelPanel from '../componentes/admin/PuertasDelPanel'
import { mensajes, puertasDe, secciones } from '../componentes/admin/seccionesDelPanel'
import { listarMensajesAdmin } from '../datos/contenido'
import { useCarga } from '../lib/useCarga'

type Props = { que: 'inicio' | 'textos' | 'frases' }

// La puerta del panel (y de sus dos secciones que juntan varias pantallas): botones grandes, uno por cosa que
// se puede hacer. En el inicio, «Mensajes» avisa cuántos hay sin leer.
export default function AdminInicio({ que }: Props) {
  const { usuario } = useSesion()
  const { datos } = useCarga('admin:mensajes', listarMensajesAdmin)
  const sinLeer = datos?.filter((m) => !m.leido).length ?? 0

  if (que !== 'inicio') {
    const s = puertasDe[que]
    return (
      <MarcoAdmin titulo={s.titulo} migas={[{ texto: 'Panel', to: '/admin' }, { texto: s.titulo }]}>
        <p className="text-destacado text-mar-tintaSuave">{s.texto}</p>
        <PuertasDelPanel puertas={s.puertas} />
      </MarcoAdmin>
    )
  }

  const nombre = usuario?.nombre?.split(' ')[0]
  const puertas = secciones.map((s) => (s === mensajes && sinLeer > 0 ? { ...s, aviso: `${sinLeer} sin leer` } : s))

  return (
    <MarcoAdmin titulo={nombre ? `Hola, ${nombre}` : 'Hola'}>
      <p className="text-destacado text-mar-tintaSuave">¿Qué querés hacer hoy? Tocá una de las opciones.</p>
      <PuertasDelPanel puertas={puertas} />
      <p className="text-cuerpo text-mar-tintaSuave">
        Nada de lo que hagas acá se rompe: lo que ocultes se puede volver a mostrar, y antes de borrar algo siempre te vamos a preguntar.
      </p>
    </MarcoAdmin>
  )
}
