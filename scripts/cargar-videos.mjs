// Carga masiva de videos: hace lo mismo que el formulario de /admin (misma sesión de admin, mismas Edge
// Functions, mismas RLS), sin service_role ni claves de Bunny en esta compu. Re-ejecutable: lo que ya está
// cargado se saltea. Si algo falla después de crear el video en Bunny, lo descarta para no dejarlo suelto.
//
// Uso:  node scripts/cargar-videos.mjs --email tu@mail.com [--solo <slug>] [--simular] [--carpeta <ruta>]
// Pide la contraseña (la cuenta tiene que ser admin). Lee la URL y la clave pública de Supabase de `.env.local`.
// Correrlo de a una vez (no dos terminales en paralelo). Nunca publica: todo queda en borrador, y no toca
// ventanas ni piezas que ya estén publicadas.
import { execFileSync } from 'node:child_process'
import { createReadStream, readFileSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import readline from 'node:readline'
import { createClient } from '@supabase/supabase-js'
import * as tus from 'tus-js-client'

const VIDEOS = [
  { archivo: 'Ud no es su mente 1 .mov', titulo: 'Usted no es su mente', slug: 'usted-no-es-su-mente', estado: 'calma' },
  { archivo: 'ser proactivo 1.mov', titulo: 'Ser proactivo', slug: 'ser-proactivo', estado: 'olas_suaves' },
  { archivo: 'plan de vida.mov', titulo: 'Plan de vida', slug: 'plan-de-vida', estado: 'agitado' },
  { archivo: 'El Dolor.mov', titulo: 'El dolor', slug: 'el-dolor', estado: 'tormenta' },
  { archivo: 'fortalecer el espiritu.mov', titulo: 'Fortalecer el espíritu', slug: 'fortalecer-el-espiritu', estado: 'horizonte' },
  { archivo: 'Mensaje de Sai Baba.mov', titulo: 'Mensaje de Sai Baba', slug: 'mensaje-de-sai-baba', estado: 'corrientes' },
  { archivo: 'Desapego 1 .mov', titulo: 'Desapego', slug: 'desapego', estado: 'profundidades' },
  { archivo: 'trabajo fisico y trabajo interior.mov', titulo: 'Trabajo físico y trabajo interior', slug: 'trabajo-fisico-y-trabajo-interior', estado: 'mareas' },
]
const ESPERA_MS = 30_000
const ESPERA_MAXIMA_MS = 60 * 60_000 // el tier gratis de Bunny es lento, pero una hora ya es una falla

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : undefined }
const simular = process.argv.includes('--simular')
const carpeta = arg('carpeta') ?? join(homedir(), 'Downloads', 'estado-del-mar-videos')
const lista = arg('solo') ? VIDEOS.filter((v) => v.slug === arg('solo')) : VIDEOS
if (!lista.length) { console.error(`No hay ningún video con la dirección "${arg('solo')}".`); process.exit(1) }

const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split('\n').map((l) => l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^(['"])(.*)\1$/, '$2')]))
const URL_SUPABASE = env.VITE_SUPABASE_URL
const CLAVE_PUBLICA = env.VITE_SUPABASE_ANON_KEY
if (!URL_SUPABASE || !CLAVE_PUBLICA) { console.error('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en .env.local'); process.exit(1) }
const supabase = createClient(URL_SUPABASE, CLAVE_PUBLICA, { auth: { persistSession: false } })

const esperar = (ms) => new Promise((r) => setTimeout(r, ms))
const minutos = (ruta) => Math.max(1, Math.round(Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', ruta]).toString()) / 60))

function preguntar(texto, oculto = false) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
  if (oculto) rl._writeToOutput = (s) => { if (s.startsWith(texto)) process.stdout.write(texto) }
  return new Promise((r) => rl.question(texto, (v) => { rl.close(); if (oculto) process.stdout.write('\n'); r(v.trim()) }))
}

// Igual que `invocar` del front, pero devolviendo también el estado HTTP.
async function invocar(fn, body) {
  const { data: { session } } = await supabase.auth.getSession()
  const r = await fetch(`${URL_SUPABASE}/functions/v1/${fn}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: CLAVE_PUBLICA, Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(body),
  })
  return { status: r.status, cuerpo: await r.json().catch(() => null) }
}

// Si `guardar` llegó a asociar el video a una pieza (y solo se perdió la respuesta), borrarlo dejaría a la
// pieza apuntando a un video que no existe: se descarta solo si ninguna fila lo referencia.
const sinDescartar = []
async function descartar(videoId) {
  try {
    const { data: usado, error } = await supabase.from('archivos_contenido').select('contenido_id').eq('bunny_video_id', videoId).maybeSingle()
    if (error) throw error
    if (usado) return 'quedó asociado a su pieza, no se borra'
    const r = await invocar('guardar-archivo-bunny', { accion: 'descartar', videoId })
    if (r.status === 200 && r.cuerpo?.ok) return 'video descartado en Bunny'
  } catch { /* se informa abajo */ }
  sinDescartar.push(videoId)
  return `NO se pudo descartar el video ${videoId} en Bunny: borralo a mano`
}

let videoEnCurso = null
let iniciando = false
let cortado = false
async function cortar() {
  cortado = true
  if (iniciando) return // el video todavía no tiene id: se descarta apenas llegue (ver `cargar`)
  if (videoEnCurso) console.log(`\nCortado: ${await descartar(videoEnCurso)}`)
  process.exit(130)
}
for (const senal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(senal, cortar)

function subir(ruta, bytes, inicio) {
  return new Promise((resolver, rechazar) => {
    const subida = new tus.Upload(createReadStream(ruta), {
      endpoint: 'https://video.bunnycdn.com/tusupload',
      chunkSize: 50 * 1024 * 1024,
      uploadSize: bytes,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: { AuthorizationSignature: inicio.authorizationSignature, AuthorizationExpire: String(inicio.authorizationExpire), VideoId: inicio.videoId, LibraryId: inicio.libraryId },
      metadata: { filetype: 'video/quicktime', title: ruta.split('/').pop() },
      onProgress: (s, t) => process.stdout.write(`\r   subiendo… ${Math.round((s / t) * 100)}%   `),
      onError: rechazar,
      onSuccess: () => { process.stdout.write('\n'); resolver() },
    })
    subida.start()
  })
}

async function cargar(v) {
  const ruta = join(carpeta, v.archivo)
  const bytes = statSync(ruta).size
  const duracion = minutos(ruta)

  let { data: tema } = await supabase.from('temas').select('id, estado_mar, publicado').eq('slug', v.slug).maybeSingle()
  if (tema && tema.estado_mar !== v.estado) return `ventana existente con otro estado (${tema.estado_mar}), no la toco`
  if (tema?.publicado) return 'la ventana ya está publicada, no la toco (cargalo desde /admin)'
  if (!tema) {
    if (simular) return `crearía la ventana (${v.estado}) y la pieza (${duracion} min)`
    const { data: temas } = await supabase.from('temas').select('orden')
    const orden = Math.max(0, ...temas.map((t) => t.orden)) + 1
    const { data, error } = await supabase.from('temas').insert({ slug: v.slug, titulo: v.titulo, descripcion: null, estado_mar: v.estado, publicado: false, orden }).select('id, estado_mar, publicado').single()
    if (error) throw new Error(`no se pudo crear la ventana: ${error.message}`)
    tema = data
    console.log('   ventana creada (borrador)')
  }

  const { data: piezas, error: errorPiezas } = await supabase.from('contenidos').select('id, tipo, orden, publicado').eq('tema_id', tema.id)
  if (errorPiezas) throw new Error(`no se pudieron leer las piezas: ${errorPiezas.message}`)
  let pieza = piezas.find((p) => p.tipo === 'video')
  if (pieza?.publicado) return 'la pieza ya está publicada, no la toco (cargalo desde /admin)'
  if (pieza) {
    const { data: archivo, error } = await supabase.from('archivos_contenido').select('contenido_id').eq('contenido_id', pieza.id).maybeSingle()
    if (error) throw new Error(`no se pudo leer el archivo de la pieza: ${error.message}`)
    if (archivo) return 'ya estaba cargado, lo salteo'
  }
  if (simular) return pieza ? 'completaría el archivo de la pieza existente' : `crearía la pieza (${duracion} min)`
  if (!pieza) {
    const orden = Math.max(0, ...piezas.map((p) => p.orden)) + 1
    const { data, error } = await supabase.from('contenidos').insert({ tema_id: tema.id, tipo: 'video', orden, titulo: v.titulo, duracion_min: duracion, cuerpo: null, publicado: false }).select('id').single()
    if (error) throw new Error(`no se pudo crear la pieza: ${error.message}`)
    pieza = data
    console.log(`   pieza creada (borrador, ${duracion} min)`)
  }

  iniciando = true
  const { status, cuerpo: inicio } = await invocar('iniciar-subida-bunny', { tipo: 'video', nombre: v.archivo, bytes, tipoMime: 'video/quicktime' }).finally(() => { iniciando = false })
  videoEnCurso = inicio?.videoId ?? null
  if (cortado) return cortar()
  if (status !== 200 || !videoEnCurso) throw new Error(`Bunny no inició la subida: ${inicio?.mensaje ?? status}`)
  try {
    await subir(ruta, bytes, inicio)
    const hasta = Date.now() + ESPERA_MAXIMA_MS
    for (;;) {
      const r = await invocar('guardar-archivo-bunny', { accion: 'guardar', contenidoId: pieza.id, videoId: inicio.videoId, nombre: v.archivo, bytes })
      if (r.status === 200 && r.cuerpo?.ok) break
      // 409 = Bunny sigue procesando (o todavía no generó ninguna calidad): se reintenta hasta el tope.
      if (r.status !== 409 || Date.now() > hasta) throw new Error(r.cuerpo?.mensaje ?? `error ${r.status}`)
      process.stdout.write('\r   Bunny procesando… ')
      await esperar(ESPERA_MS)
    }
    videoEnCurso = null
    return 'cargado'
  } catch (e) {
    const limpieza = await descartar(inicio.videoId)
    videoEnCurso = null
    throw new Error(`${e.message} (${limpieza}; volvé a correr el script)`)
  }
}

const email = arg('email') ?? (await preguntar('Email de la cuenta admin: '))
const clave = await preguntar('Contraseña (no se muestra): ', true)
const { error: errorSesion } = await supabase.auth.signInWithPassword({ email, password: clave })
if (errorSesion) { console.error('No se pudo iniciar sesión:', errorSesion.message); process.exit(1) }
const { data: admin } = await supabase.rpc('es_admin')
if (!admin) { console.error('Esa cuenta no es admin.'); process.exit(1) }

const resumen = []
for (const v of lista) {
  console.log(`\n▸ ${v.titulo}`)
  try { resumen.push([v.titulo, await cargar(v)]) } catch (e) { resumen.push([v.titulo, `FALLÓ: ${e.message}`]) }
  console.log(`   → ${resumen.at(-1)[1]}`)
}
console.log('\nResumen:')
for (const [t, r] of resumen) console.log(`  ${t.padEnd(36)} ${r}`)
if (sinDescartar.length) console.log(`\n⚠ Videos que quedaron sueltos en Bunny (borralos desde su panel): ${sinDescartar.join(', ')}`)
await supabase.auth.signOut()
process.exit(resumen.some(([, r]) => r.startsWith('FALLÓ')) ? 1 : 0)
