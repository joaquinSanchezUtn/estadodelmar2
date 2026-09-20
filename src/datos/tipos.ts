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

export type TemaConContenidos = Tema & { contenidos: Contenido[] }

export type Rol = 'visitante' | 'suscriptora' | 'admin'
