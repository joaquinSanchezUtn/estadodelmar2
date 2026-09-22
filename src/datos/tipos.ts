// Tipos del dominio. Los campos salen de la migración 0001 (en camelCase).
// Ojo: Contenido NO lleva el id de video de Bunny. El navegador nunca lo
// conoce: la Edge Function lo resuelve y devuelve solo la URL firmada.

export type EstadoMarId =
  | 'calma'
  | 'olas_suaves'
  | 'agitado'
  | 'tormenta'
  | 'profundidades'
  | 'mareas'
  | 'corrientes'
  | 'horizonte'

export type EstadoMar = {
  id: EstadoMarId
  nombre: string
  estadoInterno: string
  ensenanza: string
}

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
  | { estado: 'cancelada'; accesoHasta: string }
  | { estado: 'pendiente' }
  | { estado: 'vencida'; desde: string }
  | { estado: 'administradora' }

// Solo para el panel de admin: incluye borradores y todos sus contenidos, con el archivo subido a Bunny
// (si lo hay). El id del video en Bunny sigue sin viajar: solo el nombre y el tamaño del archivo.
export type ArchivoDeContenido = { nombre: string; bytes: number }
export type ContenidoAdmin = Contenido & { archivo: ArchivoDeContenido | null }
export type TemaAdmin = Tema & { contenidos: ContenidoAdmin[] }

// Lo que la dueña edita de una ventana y de una pieza.
export type DatosDeTema = { titulo: string; slug: string; descripcion: string; estadoMar: EstadoMarId | null; publicado: boolean }
export type DatosDeContenido = { tipo: TipoContenido; titulo: string; duracionMin: number | null; cuerpo: string | null; publicado: boolean }

// Un archivo ya subido y a la espera de asociarse a una pieza.
export type ArchivoSubido = ArchivoDeContenido & { token: string }

export type ResultadoAdmin =
  | { ok: true; slug?: string; id?: string }
  | { ok: false; mensaje: string; errores?: Record<string, string> }

// "Quién soy": una sola fila (migración 0004), con los datos de la dueña. `campos` es una lista libre
// de pares etiqueta/valor que ella arma como quiera (ej. "Formación: Lic. en Psicología (UBA)"), en
// el orden en que se muestran. nombre/descripcion/fotoUrl pueden estar vacíos: recién puesta la fila,
// antes de que cargue nada.
export type CampoPerfil = { etiqueta: string; valor: string }
export type QuienSoy = { nombre: string | null; descripcion: string | null; fotoUrl: string | null; campos: CampoPerfil[]; publicado: boolean }

// Lo que la dueña edita: acá los campos de texto siempre son string (el formulario no distingue
// "vacío" de "null"; guardarQuienSoyAdmin guarda vacío como null para no ensuciar la base).
export type DatosDeQuienSoy = { nombre: string; descripcion: string; fotoUrl: string; campos: CampoPerfil[]; publicado: boolean }
