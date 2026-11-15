import type { QuienSoy, TemaAdmin, TipoContenido } from '../../datos/tipos'

// `publicar`: el paso se resuelve con un toque, sin salir del resumen.
export type Paso = { texto: string; to: string; accion: string; publicar?: { pieza: string } | { tema: string } }

const nombres: Record<TipoContenido, string> = { video: 'el video', meditacion: 'la meditación', ejercitacion: 'la ejercitación' }

// Lo que falta para que el sitio esté completo, en el orden en que conviene hacerlo: primero lo que ya
// está casi listo (publicar lo que tiene archivo), después los archivos que faltan subir. Las piezas que un tema
// no tiene no son un paso: no todo tema lleva meditación o ejercitación. Cada paso lleva a
// la pantalla exacta donde se resuelve.
export function proximosPasos(temas: TemaAdmin[], sinLeer: number, quienSoy: QuienSoy | null): Paso[] {
  const pasos: Paso[] = []
  if (sinLeer > 0) pasos.push({ texto: sinLeer === 1 ? 'Tenés un mensaje sin leer.' : `Tenés ${sinLeer} mensajes sin leer.`, to: '/admin/mensajes', accion: 'Leer' })

  for (const t of temas) {
    const base = `/admin/ventanas/${t.slug}`
    for (const c of t.contenidos) {
      const listo = c.tipo === 'ejercitacion' || c.archivo
      if (listo && !c.publicado) pasos.push({ texto: `Publicar ${nombres[c.tipo]} de «${t.titulo}».`, to: `${base}/contenidos/${c.id}`, accion: 'Ver', publicar: { pieza: c.id } })
    }
  }
  for (const t of temas) {
    if (!t.publicado && t.contenidos.some((c) => c.publicado)) pasos.push({ texto: `Publicar el tema «${t.titulo}».`, to: `/admin/ventanas/${t.slug}`, accion: 'Ver', publicar: { tema: t.slug } })
  }
  for (const t of temas) {
    const base = `/admin/ventanas/${t.slug}`
    for (const c of t.contenidos) {
      if (c.tipo !== 'ejercitacion' && !c.archivo) pasos.push({ texto: `Subir el archivo de ${nombres[c.tipo]} de «${t.titulo}».`, to: `${base}/contenidos/${c.id}`, accion: 'Subir' })
    }
  }

  if (!quienSoy?.nombre) pasos.push({ texto: 'Completar «Quién soy» con tus datos.', to: '/admin/quien-soy', accion: 'Completar' })
  else if (!quienSoy.publicado) pasos.push({ texto: 'Publicar «Quién soy».', to: '/admin/quien-soy', accion: 'Abrir' })
  if (temas.length === 0) pasos.push({ texto: 'Crear tu primer tema.', to: '/admin/ventanas/nueva', accion: 'Crear' })
  return pasos
}
