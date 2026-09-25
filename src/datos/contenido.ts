// Única puerta de entrada a los datos. Ningún componente importa Supabase directo.
//
// El catálogo (temas y contenidos) ya es real: cada función pide columnas explícitas (nunca
// select('*')) y la visibilidad la deciden las RLS de la migración 0002 (`temas_catalogo_publico`,
// `temas_admin`, `contenidos_con_acceso`, `contenidos_admin`), no un chequeo de rol acá. Lo único que
// este archivo decide es la rama 'bloqueado' vs 'abierto' de un tema, con `tengoAcceso()`.
//
// La suscripción y el pago (Mercado Pago), y los archivos de video/audio (Bunny Stream), también son
// reales: cada acción llama a su Edge Function y ninguna decide una transición o firma acá — solo pide
// y muestra lo que el servidor contestó.
//
// Lo que sigue simulado (todavía no tiene backend real): el contacto.
import { supabase } from '../lib/supabase'
import { estados as ESTADOS } from './constantes'
import { esAdmin, tengoAcceso } from './acceso'
import { COLUMNAS_CONTENIDO, COLUMNAS_TEMA, mapContenido, mapTema } from './mapeo'
import { esperar, hayDatosDePrueba, invocar, sinBackend } from './base'
import type { CampoPerfil, EstadoDelPago, EstadoMar, QuienSoy, Suscripcion, Tema, TemaVisible } from './tipos'

export async function listarEstados(): Promise<EstadoMar[]> {
  return [...ESTADOS]
}

// El precio real del plan, el mismo `MP_PRECIO_ARS` que usa `iniciar-suscripcion` para cobrar — nunca
// un número aparte que alguien tenga que acordarse de mantener igual. `null` mientras el secreto no
// esté cargado (ver CLAUDE.md, "Pendientes de decisión"): ahí `usePrecio()` deja el placeholder
// `[PRECIO]`.
export async function obtenerPrecio(): Promise<number | null> {
  const r = await invocar<{ precioArs: number | null }>('obtener-precio')
  return r.precioArs
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

  // 'iniciada' (el primer cobro todavía no se acreditó) se muestra igual que 'pendiente'.
  switch (data.estado) {
    case 'activa':
      return { estado: 'activa', proximoCobro: data.proximo_cobro ?? '', medioDePago: data.medio_de_pago ?? '' }
    case 'en_gracia':
      return { estado: 'en_gracia', accesoHasta: data.acceso_hasta ?? '' }
    case 'cancelada':
      return { estado: 'cancelada', accesoHasta: data.acceso_hasta ?? '' }
    case 'vencida':
      return { estado: 'vencida', desde: (data.ultimo_evento ?? data.created_at).slice(0, 10) }
    default:
      return { estado: 'pendiente' }
  }
}

// Adónde mandar a la persona para pagar: la URL del checkout alojado por Mercado Pago.
export type DestinoDePago = { url: string; externo: boolean }

export async function iniciarSuscripcion(): Promise<DestinoDePago> {
  const r = await invocar<DestinoDePago | { ok: false; mensaje: string }>('iniciar-suscripcion')
  if ('ok' in r) throw new Error(r.mensaje)
  return r
}

export async function cambiarMedioDePago(): Promise<DestinoDePago> {
  const r = await invocar<DestinoDePago | { ok: false; mensaje: string }>('cambiar-medio-de-pago')
  if ('ok' in r) throw new Error(r.mensaje)
  return r
}

export type ResultadoDeAccion = { ok: true } | { ok: false; mensaje: string }

// Cómo va un pago puntual: se lee directo de `suscripciones` (no se vuelve a llamar a Mercado Pago
// acá) porque el webhook ya escribió ahí el estado real apenas Mercado Pago le avisó. Puede tardar
// unos segundos en llegar: por eso `SuscripcionResultado.tsx` reintenta esta consulta un rato.
export async function obtenerEstadoDelPago(preapprovalId: string): Promise<EstadoDelPago> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 'desconocido'
  const { data } = await supabase.from('suscripciones').select('estado').eq('preapproval_id', preapprovalId).eq('user_id', user.id).maybeSingle()
  if (!data) return 'desconocido'
  switch (data.estado) {
    case 'activa':
      return 'aprobado'
    case 'iniciada':
      return 'procesando'
    case 'pendiente':
      return 'pendiente'
    case 'vencida':
      return 'rechazado'
    // 'cancelada' no entra en 'rechazado': llegar acá con esa fila significa que el pago sí se
    // aprobó (la suscripción llegó a activarse) y después se dio de baja — "no pudimos cobrar" sería
    // falso. Cae en 'desconocido', que manda a Mi cuenta a ver el estado real. Encontrado por la
    // auditoría de verificación de la Tanda de Mercado Pago.
    default:
      return 'desconocido'
  }
}

// La baja no corta el acceso: sigue hasta el fin del período pago. La transición se valida del lado
// del servidor (solo desde 'activa'); acá solo se pide y se muestra lo que contestó.
export async function cancelarSuscripcion(): Promise<{ ok: true; accesoHasta: string } | { ok: false; mensaje: string }> {
  return invocar('cancelar-suscripcion')
}

// Solo se puede reactivar una cancelada con el período todavía vigente: no hay cobro nuevo, así que
// con el período vencido hay que suscribirse de nuevo. La transición también se valida del lado del
// servidor.
export async function reactivarSuscripcion(): Promise<ResultadoDeAccion> {
  return invocar('reactivar-suscripcion')
}

// El formulario de contacto. Con backend real es una Edge Function que guarda el mensaje y avisa por
// correo, con límite de envíos por IP; el campo `sitioWeb` es una trampa para bots y llega vacío si es una persona.
export type MensajeDeContacto = { nombre: string; email: string; asunto: string; mensaje: string; sitioWeb: string }

export async function enviarMensajeDeContacto(_mensaje: MensajeDeContacto): Promise<ResultadoDeAccion> {
  if (!hayDatosDePrueba) return sinBackend()
  await esperar()
  return { ok: true }
}

// La dirección con la que se reproduce una pieza. La firma `firmar-video-bunny`, que repite ahí las
// condiciones (pieza publicada, ventana publicada, acceso — o admin, para poder previsualizar un
// borrador) porque el id de Bunny vive en `archivos_contenido`, aparte de `contenidos`, y esa tabla la
// RLS se la esconde a cualquiera que no sea la dueña. Vence a los ~15 minutos: por eso trae `venceEn`
// y el reproductor pide otra si hace falta. null = no hay acceso, o todavía no se subió el archivo (la
// función no distingue: ninguno de los dos casos se muestra).
export type OrigenDeMedio = { url: string; venceEn: number }

export async function obtenerOrigenDeMedio(contenidoId: string): Promise<OrigenDeMedio | null> {
  const r = await invocar<OrigenDeMedio | null | { ok: false; mensaje: string }>('firmar-video-bunny', { contenidoId })
  if (!r) return null
  if ('ok' in r) throw new Error(r.mensaje)
  // Una respuesta que no es ni `null` ni `{ok:false}` pero tampoco tiene lo que se espera (por ejemplo,
  // el cuerpo de error genérico de un 401 del gateway, sin `ok`) no puede tratarse como si fuera una
  // URL real: el reproductor quedaría con un `src` vacío en vez de mostrar el aviso de error.
  if (!('url' in r) || !('venceEn' in r)) throw new Error('No pudimos preparar la reproducción. Probá de nuevo en un rato.')
  return r
}

export * from './admin'
