import { pensamientos } from '../../datos/pensamientos'
import type { Usuario } from '../../datos/tipos'
import { indiceDelDia, numeroDeDia } from '../../lib/pensamientoDelDia'
import AtajosDeEstados from '../estados/AtajosDeEstados'

// La cabecera de Mi cuenta: un saludo con nombre, el pensamiento de hoy (el mismo de la pestaña del costado)
// y los ocho estados como atajo, para que la cuenta también sea una puerta de entrada y no solo trámites.
export default function BienvenidaCuenta({ usuario }: { usuario: Usuario }) {
  const nombre = usuario.nombre.trim().split(' ')[0] || ''
  const inicial = (nombre[0] ?? usuario.email[0] ?? '·').toUpperCase()
  const pensamiento = pensamientos[indiceDelDia(numeroDeDia(new Date()), pensamientos.length)]

  return (
    <header className="grid gap-6 rounded-burbujaGrande border border-mar-bordeAgua bg-gradient-to-br from-mar-arena via-mar-nube to-mar-aguaClara p-6 shadow-suave md:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-center lg:gap-10">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="flex size-16 shrink-0 items-center justify-center rounded-full bg-mar-primario font-titulo text-titulo-m text-mar-sobrePrimario shadow-boton">
            {inicial}
          </span>
          <div>
            <p className="text-etiqueta uppercase text-mar-atardecerTexto">Mi cuenta</p>
            <h1 className="text-titulo-l">{nombre ? `Hola, ${nombre}` : 'Hola'}</h1>
          </div>
        </div>

        <div>
          <p className="mb-3 text-cuerpo font-bold text-mar-tinta">¿Cómo está tu mar hoy?</p>
          <AtajosDeEstados />
        </div>
      </div>

      {pensamiento && (
        <figure className="rounded-burbuja bg-mar-blanco p-6 shadow-suave">
          <figcaption className="mb-3 text-etiqueta uppercase text-mar-atardecerTexto">Tu pensamiento de hoy</figcaption>
          <blockquote className="font-titulo text-titulo-s text-mar-tinta">«{pensamiento}»</blockquote>
        </figure>
      )}
    </header>
  )
}
