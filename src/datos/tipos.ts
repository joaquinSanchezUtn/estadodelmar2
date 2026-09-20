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

export type Usuario = { nombre: string; email: string }

// Fecha en formato ISO (aaaa-mm-dd).
export type Suscripcion = { estado: 'activa'; proximoCobro: string }

// Solo para el panel de admin: incluye borradores y todos sus contenidos.
export type TemaAdmin = Tema & { contenidos: Contenido[] }
