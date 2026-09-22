// Única puerta de entrada a los datos. Ningún componente importa Supabase directo.
//
// El catálogo (temas y contenidos) ya es real: cada función pide columnas explícitas (nunca
// select('*')) y la visibilidad la deciden las RLS de la migración 0002 (`temas_catalogo_publico`,
// `temas_admin`, `contenidos_con_acceso`, `contenidos_admin`), no un chequeo de rol acá. Lo único que
// este archivo decide es la rama 'bloqueado' vs 'abierto' de un tema, con `tengoAcceso()`.
//
// Lo que sigue simulado (todavía no tiene backend real): pago y suscripción (Mercado Pago), el
// contacto y el origen del medio (Bunny Stream) — todos Edge Functions pendientes. Esas funciones
// siguen gateadas por `hayDatosDePrueba` y tiran `sinBackend()` fuera de ese modo.
import { supabase } from '../lib/supabase'
import { estados as ESTADOS } from './constantes'
import { esAdmin, tengoAcceso } from './acceso'
import { archivoDe } from './admin'
import { COLUMNAS_CONTENIDO, COLUMNAS_TEMA, mapContenido, mapTema } from './mapeo'
import { silencioWav } from './medioSimulado'
import { estadoDelPago, fijarSuscripcionSimulada, nuevoPago, periodoVigente, suscripcionSimulada, type EstadoDelPago } from './suscripcionSimulada'
import { esperar, hayDatosDePrueba, sinBackend } from './base'
import type { CampoPerfil, EstadoMar, QuienSoy, Suscripcion, Tema, TemaVisible } from './tipos'

export async function listarEstados(): Promise<EstadoMar[]> {
  return [...ESTADOS]
}

// Catálogo público: solo temas publicados. El filtro va en la consulta (no alcanza con la RLS): una
// admin con sesión también vería sus borradores por `temas_admin`, y este listado es el público. Un
// error de red no puede mostrarse como "no hay ventanas": se propaga para que la pantalla lo diga.
export async function listarTemas(): Promise<Tema[]> {
  const { data, error } = await supabase.from('temas').select(COLUMNAS_TEMA).eq('publicado', true).order('orden')
  if (error) throw error
  return data.map(mapTema)
}

// El tema, con sus contenidos si hay acceso; o null si no existe o no es visible.
// La fila de `temas` ya la filtra la RLS (publicado, o cualquiera si es admin): si no vuelve nada,
// no existe o no toca mostrarla. Los `contenidos` los filtra `contenidos_con_acceso`/`contenidos_admin`
// igual de estricto: acá solo falta decidir si mostrarlos o la vista bloqueada.
//
// Con sesión de admin, esto también sirve de vista previa de un borrador (ventana o pieza sin
// publicar): es a propósito, la misma admin es la única que puede verlo. Por eso no repite el filtro
// `publicado` que sí lleva `listarTemas()` — si en algún momento se quiere que /tema/:slug nunca
// muestre un borrador ni a la propia admin, hay que sumarlo acá explícitamente.
export async function obtenerTema(slug: string): Promise<TemaVisible | null> {
  const { data: fila, error } = await supabase.from('temas').select(COLUMNAS_TEMA).eq('slug', slug).maybeSingle()
  if (error) throw error
  if (!fila) return null
  const tema = mapTema(fila)

  if (!(await tengoAcceso())) return { ...tema, acceso: 'bloqueado' }

  const { data: filas, error: errorContenidos } = await supabase.from('contenidos').select(COLUMNAS_CONTENIDO).eq('tema_id', tema.id).order('orden')
  if (errorContenidos) throw errorContenidos
  return { ...tema, acceso: 'abierto', contenidos: filas.map(mapContenido) }
}

// Los datos de la dueña (migración 0004): siempre una sola fila. La RLS decide igual que en
// `obtenerTema()` — pública si `publicado`, la admin la ve siempre (para poder editarla aunque esté
// oculta) — así que acá no hace falta ningún chequeo de más.
export async function obtenerQuienSoy(): Promise<QuienSoy | null> {
  const { data, error } = await supabase.from('quien_soy').select('nombre,descripcion,foto_url,campos,publicado').maybeSingle()
  if (error) throw error
  if (!data) return null
  return {
    nombre: data.nombre,
    descripcion: data.descripcion,
    fotoUrl: data.foto_url,
    campos: Array.isArray(data.campos) ? (data.campos as CampoPerfil[]) : [],
    publicado: data.publicado,
  }
}

// Estado de la suscripción de la sesión actual, o null si no tiene una.
export async function obtenerSuscripcion(): Promise<Suscripcion | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  if (await esAdmin()) return { estado: 'administradora' }

  const { data } = await supabase
    .from('suscripciones')
    .select('estado, acceso_hasta, proximo_cobro, medio_de_pago, ultimo_evento, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!data) return null

  // 'iniciada' (el primer cobro todavía no se acreditó) se muestra igual que 'pendiente'. 'en_gracia'
  // (cobro que falló, con los 3 días de gracia) se muestra igual que 'cancelada': en los dos casos el
  // mensaje correcto es "tenés acceso hasta tal fecha". Van a necesitar su propio texto cuando el
  // webhook de Mercado Pago exista de verdad (hoy esas filas no las escribe nadie todavía).
  switch (data.estado) {
    case 'activa':
      return { estado: 'activa', proximoCobro: data.proximo_cobro ?? '', medioDePago: data.medio_de_pago ?? '' }
    case 'cancelada':
    case 'en_gracia':
      return { estado: 'cancelada', accesoHasta: data.acceso_hasta ?? '' }
    case 'vencida':
      return { estado: 'vencida', desde: (data.ultimo_evento ?? data.created_at).slice(0, 10) }
    default:
      return { estado: 'pendiente' }
  }
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
  // La RLS ya hace todo el trabajo de "¿se le puede mostrar esto a esta sesión?": publicada, con la
  // ventana publicada, y con acceso (o cualquiera si es admin). Si no vuelve nada, no se muestra.
  const { data: c } = await supabase.from('contenidos').select('id, tipo').eq('id', contenidoId).maybeSingle()
  if (!c || c.tipo === 'ejercitacion') return null
  if (!(await archivoDe(c.id))) return null // todavía no se subió el archivo
  return { url: silencioWav(30), venceEn: Date.now() + 15 * 60 * 1000 }
}

export * from './admin'
