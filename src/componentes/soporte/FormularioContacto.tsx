import { useState, type FormEvent } from 'react'
import { useSesion } from '../../auth/SesionContext'
import { enviarMensajeDeContacto } from '../../datos/contenido'
import { enfocarCampo } from '../../lib/enfocar'
import { useAccion } from '../../lib/useAccion'
import { emailValido } from '../../lib/validar'
import Aviso from '../base/Aviso'
import AreaTexto from '../base/AreaTexto'
import Boton from '../base/Boton'
import Campo from '../base/Campo'
import Selector from '../base/Selector'

const asuntos = [
  { valor: 'consulta', texto: 'Una consulta' },
  { valor: 'cuenta', texto: 'Mi cuenta o mi acceso' },
  { valor: 'pagos', texto: 'Pagos y suscripción' },
  { valor: 'datos', texto: 'Mis datos personales' },
  { valor: 'otro', texto: 'Otro tema' },
]
const MINIMO = 10
const MAXIMO = 2000

type Errores = { nombre?: string; email?: string; mensaje?: string }

export default function FormularioContacto({ onEnviado }: { onEnviado: () => void }) {
  const { usuario } = useSesion()
  const [errores, setErrores] = useState<Errores>({})
  const [largo, setLargo] = useState(0)
  const { pendiente, error, ejecutar } = useAccion()

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formulario = e.currentTarget
    const d = new FormData(formulario)
    const nombre = String(d.get('nombre') ?? '').trim()
    const email = String(d.get('email') ?? '').trim()
    const mensaje = String(d.get('mensaje') ?? '').trim()

    const nuevos: Errores = {
      nombre: nombre ? undefined : 'Contanos cómo te llamás.',
      email: emailValido(email) ? undefined : 'Escribí un email válido, por ejemplo nombre@correo.com.',
      mensaje: mensaje.length >= MINIMO ? undefined : `Contanos un poco más (al menos ${MINIMO} caracteres).`,
    }
    setErrores(nuevos)
    const primero = (['nombre', 'email', 'mensaje'] as const).find((k) => nuevos[k])
    if (primero) return enfocarCampo(formulario, primero)

    const ok = await ejecutar(async () => {
      const asunto = asuntos.find((a) => a.valor === d.get('asunto'))?.valor ?? 'otro' // solo valores de la lista
      const r = await enviarMensajeDeContacto({ nombre, email, asunto, mensaje, sitioWeb: String(d.get('sitio_web') ?? '') })
      return r.ok ? null : r.mensaje
    })
    if (ok) onEnviado()
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <Campo etiqueta="Nombre" name="nombre" autoComplete="name" maxLength={80} defaultValue={usuario?.nombre} error={errores.nombre} />
      <Campo etiqueta="Email" name="email" type="email" autoComplete="email" maxLength={254} defaultValue={usuario?.email} error={errores.email} />
      <Selector etiqueta="Sobre qué querés escribirnos" name="asunto" opciones={asuntos} />
      <div className="flex flex-col gap-2">
        <AreaTexto
          etiqueta="Mensaje"
          name="mensaje"
          rows={6}
          maxLength={MAXIMO}
          onChange={(e) => setLargo(e.target.value.length)}
          ayuda={`${largo} de ${MAXIMO} caracteres`}
          aria-invalid={errores.mensaje ? true : undefined}
        />
        {errores.mensaje && <p className="text-meta text-mar-coral">{errores.mensaje}</p>}
      </div>

      {/* Trampa para bots: una persona nunca ve ni llena este campo. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label>
          No completar
          <input name="sitio_web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {error && <Aviso>{error}</Aviso>}
      <Boton type="submit" disabled={pendiente} aria-busy={pendiente} className="w-full sm:w-auto">
        {pendiente ? 'Enviando…' : 'Enviar el mensaje'}
      </Boton>
    </form>
  )
}
