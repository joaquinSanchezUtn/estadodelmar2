import { useState } from 'react'
import { Link } from 'react-router-dom'
import { moverContenidoAdmin } from '../../datos/contenido'
import type { ResultadoAdmin, TemaAdmin } from '../../datos/tipos'
import { minutos } from '../../lib/formato'
import { useAccion } from '../../lib/useAccion'
import Aviso from '../base/Aviso'
import Boton from '../base/Boton'
import Sello from '../base/Sello'
import BotonesDeOrden from './BotonesDeOrden'
import { nombresDePieza, tiposDePieza as tipos } from './seccionesDelPanel'


type Props = { tema: TemaAdmin; onCambio: () => void }

// Lo que tiene el tema adentro, en el orden en que lo ven las suscriptoras: videos, meditaciones y ejercitaciones,
// todas las que se quiera de cada una (desde la 0020). Se abre cada una para cambiarla, se ordenan y se agregan más.
export default function PiezasDeVentana({ tema, onCambio }: Props) {
  const accion = useAccion()
  const [aviso, setAviso] = useState<string | null>(null)
  const correr = (hacer: () => Promise<ResultadoAdmin>, texto: string) =>
    accion.ejecutar(async () => {
      const r = await hacer()
      if (!r.ok) return r.mensaje
      setAviso(texto)
      onCambio()
      return null
    })

  return (
    <section aria-labelledby="piezas-titulo" className="flex flex-col gap-5 rounded-burbuja border-2 border-mar-primario bg-mar-blanco p-5 shadow-suave md:p-8">
      <div>
        <h2 id="piezas-titulo" className="text-titulo-m">
          Videos y contenido de este tema
        </h2>
        <p className="mt-1 text-cuerpo text-mar-tintaSuave">Las suscriptoras los ven en este orden, de arriba hacia abajo.</p>
      </div>

      {aviso && <Aviso tono="info">{aviso}</Aviso>}
      {accion.error && <Aviso>{accion.error}</Aviso>}

      {tema.contenidos.length === 0 ? (
        <p className="rounded-tarjeta border border-dashed border-mar-bordeAgua bg-mar-nube p-6 text-destacado text-mar-tintaSuave">Este tema todavía está vacío. Empezá agregando un video con el botón de abajo.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {tema.contenidos.map((c, i) => {
            const abrir = `/admin/ventanas/${tema.slug}/contenidos/${c.id}`
            const faltaArchivo = c.tipo !== 'ejercitacion' && !c.archivo
            return (
              <li key={c.id} className="flex flex-col gap-3 rounded-tarjeta border border-mar-bordeAgua p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span aria-hidden="true" className="text-titulo-m">
                    {nombresDePieza[c.tipo].icono}
                  </span>
                  <div className="min-w-0">
                    <p className="text-meta text-mar-tintaSuave">
                      {i + 1}. {nombresDePieza[c.tipo].nombre}
                      {c.duracionMin ? ` · ${minutos(c.duracionMin)}` : ''}
                    </p>
                    <Link to={abrir} className="text-destacado font-bold text-mar-tinta no-underline hover:underline">
                      {c.titulo}
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Sello tono={c.publicado ? 'agua' : 'coral'}>{c.publicado ? 'Se ve' : 'Oculto'}</Sello>
                      {faltaArchivo && <Sello tono="coral">Falta subir el archivo</Sello>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <BotonesDeOrden nombre={c.titulo} posicion={i} total={tema.contenidos.length} pendiente={accion.pendiente} mover={(d) => moverContenidoAdmin(c.id, d)} correr={correr} />
                  <Boton compacto to={abrir}>
                    Abrir
                  </Boton>
                </div>
              </li>
            )
          })}
        </ol>
      )}

      <div className="flex flex-wrap gap-3">
        {tipos.map((t, i) => (
          <Boton key={t} variante={i === 0 ? 'primario' : 'secundario'} to={`/admin/ventanas/${tema.slug}/contenidos/nuevo?tipo=${t}`}>
            {nombresDePieza[t].agregar}
          </Boton>
        ))}
      </div>
    </section>
  )
}
