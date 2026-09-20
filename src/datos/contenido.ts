// Única puerta de entrada a los datos. Ningún componente importa mock.ts.
// Hoy devuelve datos de prueba; mañana el cuerpo de cada función pasa a ser
// una consulta a Supabase y los componentes no se enteran.
//
// Igual que la base real, esto NO entrega contenido premium a quien no
// corresponde: sin acceso, el tema llega como 'bloqueado', sin contenidos.
//
// Al pasar a Supabase: pedir columnas explícitas (nunca select('*')) para no
// traer al navegador nada que deba resolverse en el servidor.
import { contenidos, estados, temas } from './mock'
import { accesoSimulado, rolSimulado } from './sesionSimulada'
import type { EstadoMar, Tema, TemaVisible } from './tipos'

const RETARDO_MS = 150
const esperar = () => new Promise<void>((resolver) => setTimeout(resolver, RETARDO_MS))

export async function listarEstados(): Promise<EstadoMar[]> {
  await esperar()
  return [...estados]
}

// Catálogo público: solo temas publicados, con título, slug, estado y descripción.
export async function listarTemas(): Promise<Tema[]> {
  await esperar()
  return temas.filter((t) => t.publicado).sort((a, b) => a.orden - b.orden)
}

// El tema, con sus contenidos si hay acceso; o null si no existe o no es visible.
export async function obtenerTema(slug: string): Promise<TemaVisible | null> {
  await esperar()
  const rol = rolSimulado()
  const tema = temas.find((t) => t.slug === slug)
  if (!tema || (!tema.publicado && rol !== 'admin')) return null

  if (!accesoSimulado(rol)) return { ...tema, acceso: 'bloqueado' }

  const propios = contenidos
    .filter((c) => c.temaId === tema.id && (c.publicado || rol === 'admin'))
    .sort((a, b) => a.orden - b.orden)
  return { ...tema, acceso: 'abierto', contenidos: propios }
}
