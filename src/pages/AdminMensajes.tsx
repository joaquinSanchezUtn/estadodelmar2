import { useState } from 'react'
import MarcoAdmin from '../componentes/admin/MarcoAdmin'
import Aviso from '../componentes/base/Aviso'
import Boton from '../componentes/base/Boton'
import ErrorDeCarga from '../componentes/base/ErrorDeCarga'
import Esqueleto from '../componentes/base/Esqueleto'
import Sello from '../componentes/base/Sello'
import { listarMensajesAdmin, marcarMensajeAdmin } from '../datos/contenido'
import { useCarga } from '../lib/useCarga'

const migas = [{ texto: 'Panel', to: '/admin' }, { texto: 'Mensajes' }]
const asuntos: Record<string, string> = { consulta: 'Una consulta', cuenta: 'Cuenta o acceso', pagos: 'Pagos y suscripción', datos: 'Datos personales', otro: 'Otro tema' }
const cuando = (iso: string) => new Date(iso).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

// Lo que llega por /contacto, del más nuevo al más viejo. Se responde por email, desde el correo propio.
export default function AdminMensajes() {
  const { datos, cargando, error, reintentar } = useCarga('admin:mensajes', listarMensajesAdmin)
  const [fallo, setFallo] = useState<string | null>(null)
  const sinLeer = datos?.filter((m) => !m.leido).length ?? 0

  const marcar = async (id: string, leido: boolean) => {
    const r = await marcarMensajeAdmin(id, leido)
    setFallo(r.ok ? null : r.mensaje)
    reintentar()
  }

  return (
    <MarcoAdmin titulo="Mensajes" migas={migas}>
      {error ? (
        <ErrorDeCarga texto="No pudimos leer los mensajes." onReintentar={reintentar} />
      ) : cargando || !datos ? (
        <div role="status">
          <p className="sr-only">Cargando…</p>
          <Esqueleto className="h-40" />
        </div>
      ) : datos.length === 0 ? (
        <p className="rounded-tarjeta border border-dashed border-mar-bordeAgua bg-mar-blanco/60 p-5 text-cuerpo text-mar-tintaSuave">
          Todavía no llegó ningún mensaje por el formulario de contacto.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <p role="status" className="text-cuerpo text-mar-tintaSuave">
            {datos.length} {datos.length === 1 ? 'mensaje' : 'mensajes'}
            {sinLeer > 0 && ` · ${sinLeer} sin leer`}
          </p>
          {fallo && <Aviso>{fallo}</Aviso>}
          <ul className="flex flex-col gap-3">
            {datos.map((m) => (
              <li key={m.id} className="flex flex-col gap-3 rounded-tarjeta border border-mar-bordeAgua bg-mar-blanco p-4 md:p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Sello tono={m.leido ? 'neutro' : 'agua'}>{m.leido ? 'Leído' : 'Nuevo'}</Sello>
                  {m.sospechoso && <Sello tono="coral">Posible spam</Sello>}
                  <span className="font-titulo text-titulo-s">{m.nombre}</span>
                  <a href={`mailto:${encodeURIComponent(m.email)}`} className="text-cuerpo">{m.email}</a>
                </div>
                <p className="text-meta text-mar-tintaSuave">
                  {asuntos[m.asunto] ?? m.asunto} · {cuando(m.creadoEn)}
                </p>
                <p className="whitespace-pre-line text-cuerpo text-mar-tinta">{m.mensaje}</p>
                <div>
                  <Boton compacto variante="secundario" onClick={() => marcar(m.id, !m.leido)}>
                    {m.leido ? 'Marcar como nuevo' : 'Marcar como leído'}
                  </Boton>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </MarcoAdmin>
  )
}
