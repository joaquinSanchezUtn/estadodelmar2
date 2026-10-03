// Tipos del dominio. Los campos salen de la migración 0001 (en camelCase).
// Ojo: Contenido NO lleva el id de video de Bunny. El navegador nunca lo
// conoce: la Edge Function lo resuelve y devuelve solo la URL firmada.

// Los ocho aspectos (color de tarjeta + dibujo animado) que puede llevar una ventana. Son fijos: cada uno
// tiene su paleta validada por contraste en tailwind.config.js. Se llaman como las ocho ventanas originales.
export type EstiloId =
  | 'calma'
  | 'olas_suaves'
  | 'agitado'
  | 'tormenta'
  | 'profundidades'
  | 'mareas'
  | 'corrientes'
  | 'horizonte'

// Una "ventana" de la home (Mar en calma, Tormenta…): desde la migración 0015 es una fila de `estados`,
// que la dueña edita desde el panel. El id es fijo (va en la URL y en `temas.estado_mar`).
export type EstadoMarId = string

export type EstadoMar = {
  id: EstadoMarId
  nombre: string
  estadoInterno: string
  ensenanza: string
  estilo: EstiloId
  // URL pública de la foto, o null: sin foto se ve el dibujo del estilo.
  fotoUrl: string | null
}

export type EstadoMarAdmin = EstadoMar & { foto: string | null; orden: number; publicado: boolean }
export type DatosDeEstado = { nombre: string; estadoInterno: string; ensenanza: string; estilo: EstiloId; publicado: boolean }

// Desde dónde se mira el tema (independiente del estado del mar): el pedido original distingue temas
// psicológicos, filosóficos y transpersonales ("más allá de la personalidad, incluyendo lo espiritual").
export type EnfoqueId = 'psicologico' | 'filosofico' | 'transpersonal'
export type Enfoque = { id: EnfoqueId; nombre: string; descripcion: string }

export type TipoContenido = 'video' | 'meditacion' | 'ejercitacion'

// Dato público del tema: qué piezas tiene y cuánto dura cada una.
// Sirve para mostrar la vista bloqueada sin exponer contenido premium.
export type Pieza = {
  tipo: TipoContenido
  duracionMin: number | null
}

export type Tema = {
  id: string
  slug: string
  titulo: string
  descripcion: string
  estadoMar: EstadoMarId | null
  enfoque: EnfoqueId | null
  publicado: boolean
  orden: number
  piezas: Pieza[]
}

// Premium: solo llega al navegador si la persona tiene acceso activo.
export type Contenido = {
  id: string
  temaId: string
  tipo: TipoContenido
  titulo: string
  cuerpo: string | null
  duracionMin: number | null
  publicado: boolean
  orden: number
}

// El dato dice si el acceso está abierto: el componente decide qué mostrar según
// lo que recibió, sin consultar la sesión. En 'bloqueado' no hay contenidos.
export type TemaVisible = Tema &
  ({ acceso: 'abierto'; contenidos: Contenido[] } | { acceso: 'bloqueado' })

// 'registrada' es quien tiene cuenta pero no suscripción: en la base, role='user'
// con suscripcion_activa=false. No tiene acceso al contenido premium.
export type Rol = 'visitante' | 'registrada' | 'suscriptora' | 'admin'

export type Usuario = { nombre: string; email: string; conGoogle: boolean }

// proximoCobro va en formato ISO (aaaa-mm-dd). 'administradora' es acceso por rol, sin cobro.
// - activa: paga y con acceso; se renueva sola.
// - cancelada: dio de baja pero conserva el acceso hasta `accesoHasta`; después no se renueva.
// - pendiente: el pago todavía no se acreditó (efectivo, transferencia): sin acceso hasta que llegue.
// - vencida: el cobro falló o venció: sin acceso hasta reactivarla.
export type Suscripcion =
  | { estado: 'activa'; proximoCobro: string; medioDePago: string }
  // Un cobro rebotó: quedan `acceso_hasta` (3 días) para actualizar el medio de pago. Distinto de
  // 'cancelada' (fue una decisión de la persona, no un cobro fallido): el camino de vuelta también es
  // otro — cambiar la tarjeta, no "reactivar".
  | { estado: 'en_gracia'; accesoHasta: string }
  | { estado: 'cancelada'; accesoHasta: string }
  | { estado: 'pendiente' }
  | { estado: 'vencida'; desde: string }
  | { estado: 'administradora' }

// Cómo le fue a un intento de pago puntual (identificado por su preapproval_id), para la pantalla de
// vuelta de Mercado Pago. 'procesando' es "todavía no llegó el webhook"; no es lo mismo que 'pendiente'
// (un medio de pago que tarda días en acreditarse, como una transferencia).
export type EstadoDelPago = 'aprobado' | 'pendiente' | 'rechazado' | 'procesando' | 'desconocido'

// Solo para el panel de admin: incluye borradores y todos sus contenidos, con el archivo subido a Bunny
// (si lo hay). El id del video en Bunny sigue sin viajar: solo el nombre y el tamaño del archivo.
export type ArchivoDeContenido = { nombre: string; bytes: number }
export type ContenidoAdmin = Contenido & { archivo: ArchivoDeContenido | null }
export type TemaAdmin = Tema & { contenidos: ContenidoAdmin[] }

// Lo que la dueña edita de una ventana y de una pieza.
export type DatosDeTema = { titulo: string; slug: string; descripcion: string; estadoMar: EstadoMarId | null; enfoque: EnfoqueId | null; publicado: boolean }

// Un mensaje del formulario de contacto, tal como lo lee la admin.
export type MensajeDeContactoAdmin = { id: string; nombre: string; email: string; asunto: string; mensaje: string; sospechoso: boolean; leido: boolean; creadoEn: string }
export type DatosDeContenido = { tipo: TipoContenido; titulo: string; duracionMin: number | null; cuerpo: string | null; publicado: boolean }

// Un archivo ya subido y a la espera de asociarse a una pieza.
export type ArchivoSubido = ArchivoDeContenido & { token: string }

export type ResultadoAdmin =
  | { ok: true; slug?: string; id?: string }
  | { ok: false; mensaje: string; errores?: Record<string, string>; id?: string }

// "Quién soy": una sola fila (migración 0004), con los datos de la dueña. `campos` es una lista libre
// de pares etiqueta/valor que ella arma como quiera (ej. "Formación: Lic. en Psicología (UBA)"), en
// el orden en que se muestran. nombre/descripcion/fotoUrl pueden estar vacíos: recién puesta la fila,
// antes de que cargue nada.
export type CampoPerfil = { etiqueta: string; valor: string }
export type QuienSoy = { nombre: string | null; descripcion: string | null; fotoUrl: string | null; campos: CampoPerfil[]; publicado: boolean }

// Lo que la dueña edita: acá los campos de texto siempre son string (el formulario no distingue
// "vacío" de "null"; guardarQuienSoyAdmin guarda vacío como null para no ensuciar la base).
export type DatosDeQuienSoy = { nombre: string; descripcion: string; fotoUrl: string; campos: CampoPerfil[]; publicado: boolean }
