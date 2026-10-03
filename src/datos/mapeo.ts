// Mapea filas de `temas`/`contenidos` (snake_case, como vienen de Supabase) a los tipos del front
// (camelCase). Un solo lugar: `contenido.ts` y `admin.ts` lo comparten, para que una columna nueva no
// se agregue en un archivo y se olvide en el otro.
import { urlPublica } from '../lib/activos'
import type { Contenido, EnfoqueId, EstadoMarId, Pieza, Tema, TipoContenido } from './tipos'

export type FilaTema = { id: string; slug: string; titulo: string; descripcion: string | null; estado_mar: EstadoMarId | null; enfoque: EnfoqueId | null; publicado: boolean; orden: number; piezas: unknown; foto: string | null }
export type FilaContenido = { id: string; tema_id: string; tipo: TipoContenido; titulo: string; cuerpo: string | null; duracion_min: number | null; publicado: boolean; orden: number }

export const COLUMNAS_TEMA = 'id,slug,titulo,descripcion,estado_mar,enfoque,publicado,orden,piezas,foto'
export const COLUMNAS_CONTENIDO = 'id,tema_id,tipo,titulo,cuerpo,duracion_min,publicado,orden'

export function mapTema(f: FilaTema): Tema {
  const piezas = Array.isArray(f.piezas) ? (f.piezas as { tipo: TipoContenido; duracion_min: number | null }[]) : []
  return {
    id: f.id,
    slug: f.slug,
    titulo: f.titulo,
    descripcion: f.descripcion ?? '',
    estadoMar: f.estado_mar,
    enfoque: f.enfoque,
    publicado: f.publicado,
    orden: f.orden,
    piezas: piezas.map((p): Pieza => ({ tipo: p.tipo, duracionMin: p.duracion_min })),
    fotoUrl: f.foto ? urlPublica(f.foto) : null,
  }
}

export function mapContenido(f: FilaContenido): Contenido {
  return { id: f.id, temaId: f.tema_id, tipo: f.tipo, titulo: f.titulo, cuerpo: f.cuerpo, duracionMin: f.duracion_min, publicado: f.publicado, orden: f.orden }
}
