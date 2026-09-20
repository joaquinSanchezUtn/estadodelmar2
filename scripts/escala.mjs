// Chequeo de la escala: falla si en src/ hay tamaños, radios, alturas, capas o espaciados
// que no salen de tailwind.config.js. Uso: `npm run escala`.
// Excepción puntual: un comentario `escala-ok: <motivo>` en la misma línea.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const raiz = new URL('..', import.meta.url).pathname
const archivos = []
const recorrer = (dir) => {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre)
    if (statSync(ruta).isDirectory()) recorrer(ruta)
    else if (/\.(tsx?|css)$/.test(nombre)) archivos.push(ruta)
  }
}
recorrer(join(raiz, 'src'))
archivos.push(join(raiz, 'index.html'))

// Prefijos de utilidades de espaciado y de tamaño: no admiten medios pasos ni valores sueltos.
const ESPACIO = '(?:-?(?:p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me)|gap|gap-x|gap-y|space-x|space-y|inset|inset-x|inset-y|top|right|bottom|left|w|h|size|min-w|min-h|max-w|max-h|-?translate-x|-?translate-y)'
// Cada regla mira una clase (un "token" separado por espacios/comillas) sin sus variantes (md:, hover:…).
const reglas = [
  { id: 'tipografia', msg: 'Tamaño de texto suelto: usar text-etiqueta|meta|cuerpo|destacado|titulo-s|m|l|xl', prueba: (c) => /^text-(\[[^\]]+\]|xs|sm|base|lg|xl|[2-9]xl)$/.test(c) },
  { id: 'interlineado', msg: 'Interlineado suelto: ya viene dentro del nivel tipográfico', prueba: (c) => /^leading-/.test(c) },
  { id: 'tracking', msg: 'Tracking suelto: text-etiqueta ya lo trae', prueba: (c) => /^tracking-/.test(c) },
  { id: 'radio', msg: 'Radio fuera de la escala: usar rounded-control|tarjeta|burbuja|burbujaGrande|full', prueba: (c) => /^rounded(-[a-z]{1,2})?(-(none|sm|md|lg|xl|2xl|3xl|\[[^\]]+\]))?$/.test(c) && !/^rounded-(full|none)$/.test(c) && !/^rounded-[a-z]{1,2}-(none)$/.test(c) },
  { id: 'capa', msg: 'z-index suelto: usar z-encabezado|menu|flotante', prueba: (c) => /^z-(\d+|\[[^\]]+\])$/.test(c) },
  { id: 'medio-paso', msg: 'Espaciado fuera de la grilla de 4px (0.5, 1.5, 2.5, 3.5)', prueba: (c) => new RegExp(`^${ESPACIO}-\\d+\\.5$`).test(c) },
  { id: 'valor-suelto', msg: 'Medida entre corchetes: usar un token de la escala', prueba: (c) => new RegExp(`^${ESPACIO}-\\[[^\\]]+\\]$`).test(c) || /^(border(-[trblxy])?|ring|outline|stroke|shadow|blur|opacity)-\[[^\]]+\]$/.test(c) },
  { id: 'ancho', msg: 'Ancho fuera de la escala: usar max-w-angosto|lectura|ancho|parrafo|ojo', prueba: (c) => /^max-w-(xs|sm|md|lg|xl|[2-7]xl|screen-.*)$/.test(c) },
  { id: 'peso', msg: 'Peso fuera de light|normal|medium|bold', prueba: (c) => /^font-(thin|extralight|semibold|extrabold|black)$/.test(c) },
  { id: 'hex', msg: 'Color suelto: usar un token mar.* o estado.*', prueba: (c) => /#[0-9a-fA-F]{3,8}\b/.test(c) && /^[a-z-]+-\[/.test(c) },
]

const problemas = new Map()
for (const archivo of archivos) {
  const lineas = readFileSync(archivo, 'utf8').split('\n')
  lineas.forEach((linea, i) => {
    if (linea.includes('escala-ok')) return
    // Un token de clase es cualquier cosa entre espacios/comillas (las comas y paréntesis de un valor entre corchetes no lo cortan); se le quitan las variantes (md:, hover:, has-[..]:).
    for (const bruto of linea.split(/[\s"'`{}]+/)) {
      const crudo = bruto.replace(/^[(,]+|[),;]+$/g, '')
      if (!crudo) continue
      const c = crudo.replace(/^(?:[a-z0-9-]+(?:-\[[^\]]*\])?:)+/, '').replace(/^!/, '')
      for (const r of reglas) {
        if (!r.prueba(c)) continue
        const lista = problemas.get(r.id) ?? { msg: r.msg, items: [] }
        lista.items.push(`${relative(raiz, archivo)}:${i + 1}  ${crudo}`)
        problemas.set(r.id, lista)
      }
    }
  })
}

let total = 0
for (const [id, { msg, items }] of problemas) {
  total += items.length
  console.log(`\n${id} (${items.length}) — ${msg}`)
  for (const it of process.argv.includes('--todo') ? items : items.slice(0, 5)) console.log('  ' + it)
  if (!process.argv.includes('--todo') && items.length > 5) console.log(`  … ${items.length - 5} más (--todo para verlas)`)
}
console.log(total ? `\n✗ ${total} valores fuera de la escala` : '✓ Todo sale de la escala')
process.exit(total ? 1 : 0)
