import { useState } from 'react'
import type { EstadoMar, EstadoMarId, TemaAdmin } from '../../datos/tipos'
import AreaTexto from '../base/AreaTexto'
import Boton from '../base/Boton'
import Campo from '../base/Campo'
import Interruptor from '../base/Interruptor'
import Selector from '../base/Selector'
import ListaContenidos from './ListaContenidos'
import ZonaArchivos from './ZonaArchivos'

type Props = { tema: TemaAdmin; estados: EstadoMar[] }

// Nada se guarda todavía: los campos mantienen su estado local y punto.
// Se monta con key={tema.slug}, así al elegir otra ventana el formulario se reinicia.
export default function EditorVentana({ tema, estados }: Props) {
  const [titulo, setTitulo] = useState(tema.titulo)
  const [slug, setSlug] = useState(tema.slug)
  const [estadoMar, setEstadoMar] = useState<EstadoMarId | ''>(tema.estadoMar ?? '')
  const [descripcion, setDescripcion] = useState(tema.descripcion)
  const [visible, setVisible] = useState(tema.publicado)

  const opciones = [
    ...(estadoMar === '' ? [{ valor: '', texto: 'Sin estado' }] : []),
    ...estados.map((e) => ({ valor: e.id, texto: e.nombre })),
  ]

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col gap-5 rounded-2xl border border-mar-bordeAgua bg-mar-blanco p-5 md:p-6"
    >
      <h2 className="text-2xl font-normal">Editar «{tema.titulo}»</h2>

      <Campo
        etiqueta="Título"
        name="titulo"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        required
      />
      <Campo
        etiqueta="Slug"
        name="slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        ayuda={`Dirección de la ventana: /tema/${slug || '…'}`}
        autoComplete="off"
        spellCheck={false}
        required
      />
      <Selector
        etiqueta="Estado del mar"
        name="estadoMar"
        value={estadoMar}
        onChange={(e) => setEstadoMar(e.target.value as EstadoMarId)}
        opciones={opciones}
      />
      <AreaTexto
        etiqueta="Descripción pública"
        ayuda="Se ve en el catálogo, incluso sin suscripción."
        name="descripcion"
        rows={3}
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />

      <ListaContenidos contenidos={tema.contenidos} />
      <ZonaArchivos />

      <Interruptor
        etiqueta="Visible en el sitio"
        ayuda={visible ? 'Publicada: aparece en el catálogo.' : 'Borrador: solo la ves vos.'}
        activo={visible}
        onCambio={setVisible}
      />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {/* La vista previa muestra lo ya guardado; sale de esta pantalla. */}
        <Boton to={`/tema/${tema.slug}`} variante="secundario">
          Vista previa
        </Boton>
        <Boton type="submit">Guardar</Boton>
      </div>
    </form>
  )
}
