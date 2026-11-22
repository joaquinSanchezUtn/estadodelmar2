import type { TipoContenido } from '../../datos/tipos'

// Cómo se organiza el panel (rediseño del 2026-11-22, pedido de Joaquin: la dueña tiene 65 años y el panel
// de ocho secciones sueltas era difícil de entender). Cinco puertas grandes en el inicio (la del precio, el mismo día); las que juntan
// varias pantallas («Textos de la página», «Frases del día») abren una página con un botón grande por cada
// una. `rutas` dice qué direcciones marcan cada sección como la activa en el menú.
export type Puerta = { to: string; titulo: string; texto: string; icono: string }
export type Seccion = Puerta & { rutas: string[] }

export const ventanasYTemas: Seccion = {
  to: '/admin/estados',
  titulo: 'Ventanas y temas',
  texto: 'Las tarjetas de «¿Cómo está tu mar hoy?», los temas de cada una y sus videos.',
  icono: '🪟',
  rutas: ['/admin/estados', '/admin/ventanas'],
}

export const textos: Seccion = {
  to: '/admin/textos',
  titulo: 'Textos de la página',
  texto: 'Lo que se lee al entrar al sitio y la página «Quién soy».',
  icono: '✏️',
  rutas: ['/admin/textos', '/admin/portada', '/admin/como-funciona', '/admin/quien-soy'],
}

export const frases: Seccion = {
  to: '/admin/frases',
  titulo: 'Frases del día',
  texto: 'Las Semillas del mar y los Ecos del océano.',
  icono: '💬',
  rutas: ['/admin/frases', '/admin/semillas', '/admin/ecos'],
}

export const mensajes: Seccion = {
  to: '/admin/mensajes',
  titulo: 'Mensajes',
  texto: 'Lo que te escriben desde el formulario de contacto.',
  icono: '✉️',
  rutas: ['/admin/mensajes'],
}

export const precio: Seccion = {
  to: '/admin/precio',
  titulo: 'Precio de la suscripción',
  texto: 'Cuánto se paga por mes. Lo podés cambiar cuando quieras.',
  icono: '💲',
  rutas: ['/admin/precio'],
}

export const secciones = [ventanasYTemas, textos, frases, mensajes, precio]

// Lo que hay adentro de cada sección que junta varias pantallas.
export const puertasDe: Record<'textos' | 'frases', { titulo: string; texto: string; puertas: Puerta[] }> = {
  textos: {
    titulo: textos.titulo,
    texto: '¿Qué texto querés cambiar?',
    puertas: [
      { to: '/admin/portada', titulo: 'Portada', texto: 'El título grande y el texto de arriba de todo, al entrar al sitio.', icono: '🏠' },
      { to: '/admin/como-funciona', titulo: 'Cómo funciona', texto: 'Las tarjetas numeradas que explican cómo se usa el sitio.', icono: '🧭' },
      { to: '/admin/quien-soy', titulo: 'Quién soy', texto: 'Tu foto, tu nombre y lo que contás sobre vos.', icono: '🙂' },
    ],
  },
  frases: {
    titulo: frases.titulo,
    texto: '¿Qué frases querés ver o cambiar?',
    puertas: [
      { to: '/admin/semillas', titulo: 'Semillas del mar', texto: 'La pestaña de la derecha de la pantalla. Sale una por día.', icono: '🌱' },
      { to: '/admin/ecos', titulo: 'Ecos del océano', texto: 'La pestaña de la izquierda de la pantalla. Sale una por día.', icono: '🌊' },
    ],
  },
}

// Id de la "ventana" que junta los temas que no tienen ninguna. Lleva guion: los ids reales usan guion bajo
// (`mar_de_fondo`), así que nunca choca con uno.
export const SIN_VENTANA = 'sin-ventana'

// Los tres tipos de pieza de un tema, con sus nombres para el panel.
export const tiposDePieza: TipoContenido[] = ['video', 'meditacion', 'ejercitacion']
export const nombresDePieza: Record<TipoContenido, { nombre: string; nuevo: string; agregar: string; icono: string }> = {
  video: { nombre: 'Video', nuevo: 'Nuevo video', agregar: '+ Agregar un video', icono: '🎬' },
  meditacion: { nombre: 'Meditación (audio)', nuevo: 'Nueva meditación', agregar: '+ Agregar una meditación', icono: '🎧' },
  ejercitacion: { nombre: 'Ejercitación (texto)', nuevo: 'Nueva ejercitación', agregar: '+ Agregar una ejercitación', icono: '📝' },
}
