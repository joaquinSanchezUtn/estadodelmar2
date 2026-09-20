// Única puerta de entrada a los datos. Ningún componente importa mock.ts.
// Hoy devuelve datos de prueba; mañana el cuerpo de cada función pasa a ser
// una consulta a Supabase y los componentes no se enteran.
//
// Igual que la base real, esto NO entrega contenido premium a quien no
// corresponde: sin acceso, el tema llega como 'bloqueado', sin contenidos.
//
// Al pasar a Supabase: pedir columnas explícitas (nunca select('*')) para no
// traer al navegador nada que deba resolverse en el servidor.
import { accesoSimulado, rolSimulado } from './sesionSimulada'
import { silencioWav } from './medioSimulado'
import { estadoDelPago, fijarSuscripcionSimulada, nuevoPago, periodoVigente, suscripcionSimulada, type EstadoDelPago } from './suscripcionSimulada'
import { archivoDe } from './admin'
import { cargarPrueba, esperar, hayDatosDePrueba, sinBackend } from './base'
import type { EstadoMar, Suscripcion, Tema, TemaVisible } from './tipos'

export async function listarEstados(): Promise<EstadoMar[]> {
  await esperar()
  const { estados } = await cargarPrueba()
  return [...estados]
}

// Catálogo público: solo temas publicados, con título, slug, estado y descripción.
export async function listarTemas(): Promise<Tema[]> {
  await esperar()
  const { temas } = await cargarPrueba()
  return temas.filter((t) => t.publicado).sort((a, b) => a.orden - b.orden)
}

// El tema, con sus contenidos si hay acceso; o null si no existe o no es visible.
export async function obtenerTema(slug: string): Promise<TemaVisible | null> {
  await esperar()
  const { temas, contenidos } = await cargarPrueba()
  const rol = rolSimulado()
  const tema = temas.find((t) => t.slug === slug)
  if (!tema || (!tema.publicado && rol !== 'admin')) return null

  if (!accesoSimulado(rol)) return { ...tema, acceso: 'bloqueado' }

  const propios = contenidos
    .filter((c) => c.temaId === tema.id && (c.publicado || rol === 'admin'))
    .sort((a, b) => a.orden - b.orden)
  return { ...tema, acceso: 'abierto', contenidos: propios }
}

// Estado de la suscripción de la sesión actual, o null si no tiene una.
export async function obtenerSuscripcion(): Promise<Suscripcion | null> {
  await esperar()
  if (rolSimulado() === 'admin') return { estado: 'administradora' }
  return suscripcionSimulada()
}

// Adónde mandar a la persona para pagar. Con Mercado Pago es una URL externa (init_point de la
// preapproval, creada en una Edge Function); en desarrollo es una pantalla nuestra que lo simula.
export type DestinoDePago = { url: string; externo: boolean }

export async function iniciarSuscripcion(): Promise<DestinoDePago> {
  if (!hayDatosDePrueba) return sinBackend()
  await esperar()
  return { url: `/suscripcion/simular-pago?accion=suscribir&pago=${nuevoPago()}`, externo: false }
}

export async function cambiarMedioDePago(): Promise<DestinoDePago> {
  if (!hayDatosDePrueba) return sinBackend()
  await esperar()
  return { url: '/suscripcion/simular-pago?accion=tarjeta', externo: false }
}

export type ResultadoDeAccion = { ok: true } | { ok: false; mensaje: string }
const noSePudo = { ok: false, mensaje: 'No pudimos hacerlo ahora. Probá de nuevo en un rato.' } as const

// Cómo va un pago puntual. Con Mercado Pago es el estado que dejó el webhook para ese preapproval_id.
export async function obtenerEstadoDelPago(id: string): Promise<EstadoDelPago> {
  if (!hayDatosDePrueba) return sinBackend()
  await esperar()
  return estadoDelPago(id)
}

// La baja no corta el acceso: sigue hasta el fin del período pago. Devuelve hasta cuándo, para que
// el aviso diga lo que el servidor decidió. Pendiente: preapproval a 'cancelled' en MP.
export async function cancelarSuscripcion(): Promise<{ ok: true; accesoHasta: string } | typeof noSePudo> {
  if (!hayDatosDePrueba) return sinBackend()
  await esperar()
  const s = suscripcionSimulada()
  if (s?.estado !== 'activa') return noSePudo
  fijarSuscripcionSimulada({ estado: 'cancelada', accesoHasta: s.proximoCobro })
  return { ok: true, accesoHasta: s.proximoCobro }
}

// Solo se puede reactivar una cancelada con el período todavía vigente: no hay cobro nuevo, así que
// con el período vencido hay que pagar de nuevo.
export async function reactivarSuscripcion(): Promise<ResultadoDeAccion> {
  if (!hayDatosDePrueba) return sinBackend()
  await esperar()
  const s = suscripcionSimulada()
  if (s?.estado !== 'cancelada' || !periodoVigente(s.accesoHasta)) return noSePudo
  fijarSuscripcionSimulada({ estado: 'activa', proximoCobro: s.accesoHasta, medioDePago: 'Visa terminada en 4242' })
  return { ok: true }
}

// El formulario de contacto. Con backend real es una Edge Function que guarda el mensaje y avisa por
// correo, con límite de envíos por IP; el campo `sitioWeb` es una trampa para bots y llega vacío si es una persona.
export type MensajeDeContacto = { nombre: string; email: string; asunto: string; mensaje: string; sitioWeb: string }

export async function enviarMensajeDeContacto(_mensaje: MensajeDeContacto): Promise<ResultadoDeAccion> {
  if (!hayDatosDePrueba) return sinBackend()
  await esperar()
  return { ok: true }
}

// La dirección con la que se reproduce una pieza. Con Bunny Stream la firma una Edge Function que
// primero verifica la suscripción, y vence a los ~15 minutos: por eso trae `venceEn` y el reproductor
// pide otra si hace falta. null = todavía no hay archivo subido para esa pieza.
export type OrigenDeMedio = { url: string; venceEn: number }

export async function obtenerOrigenDeMedio(contenidoId: string): Promise<OrigenDeMedio | null> {
  if (!hayDatosDePrueba) return sinBackend()
  await esperar()
  const { contenidos, temas } = await cargarPrueba()
  const c = contenidos.find((x) => x.id === contenidoId)
  // Igual que la base: sin acceso no hay URL, aunque se conozca el id de la pieza; y una pieza o una
  // ventana sin publicar no se entrega a nadie salvo a la dueña (la Edge Function repite las tres condiciones).
  const visible = c && (rolSimulado() === 'admin' || (c.publicado && temas.find((t) => t.id === c.temaId)?.publicado))
  if (!c || !visible || c.tipo === 'ejercitacion' || !accesoSimulado(rolSimulado())) return null
  if (!(await archivoDe(c))) return null // todavía no se subió el archivo
  return { url: silencioWav(30), venceEn: Date.now() + 15 * 60 * 1000 }
}

export * from './admin'
