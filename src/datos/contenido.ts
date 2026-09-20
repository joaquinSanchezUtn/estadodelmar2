// Única puerta de entrada a los datos. Ningún componente importa mock.ts.
// Hoy devuelve datos de prueba; mañana el cuerpo de cada función pasa a ser
// una consulta a Supabase y los componentes no se enteran.
//
// Igual que la base real, esto NO entrega contenido premium a quien no
// corresponde: sin acceso activo, `contenidos` llega vacío. Los componentes
// deben manejar esa ausencia en vez de confiar en ocultar lo que ya llegó.
import { contenidos, estados, temas } from './mock'
import { rolSimulado } from './sesionSimulada'
import type { EstadoMar, Tema, TemaConContenidos } from './tipos'

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

// El tema con sus contenidos, o null si no existe o no es visible para esta sesión.
export async function obtenerTema(slug: string): Promise<TemaConContenidos | null> {
  await esperar()
  const rol = rolSimulado()
  const tema = temas.find((t) => t.slug === slug)
  if (!tema || (!tema.publicado && rol !== 'admin')) return null

  const conAcceso = rol !== 'visitante'
  const propios = contenidos
    .filter((c) => c.temaId === tema.id && (c.publicado || rol === 'admin'))
    .sort((a, b) => a.orden - b.orden)

  return { ...tema, contenidos: conAcceso ? propios : [] }
}
