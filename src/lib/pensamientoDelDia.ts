// Qué pensamiento toca hoy. Los pensamientos se recorren en "vueltas": cada vuelta es un orden mezclado de toda la
// lista, así que ninguno se repite hasta haber mostrado todos. Cada vuelta se mezcla distinto (la semilla
// es el número de vuelta), y si el primero de una vuelta coincide con el último de la anterior, se cambian
// de lugar: tampoco se repite justo en el cambio de vuelta. Todo es determinístico: el mismo día da el
// mismo pensamiento en cualquier dispositivo, sin guardar nada.
const ORIGEN = Date.UTC(2026, 0, 1)
const DIA_MS = 86_400_000

// Generador pseudoaleatorio chico y estable (mulberry32): misma semilla, misma secuencia.
function aleatorio(semilla: number) {
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function ordenDeVuelta(vuelta: number, n: number): number[] {
  const azar = aleatorio(vuelta + 1)
  const orden = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1))
    ;[orden[i], orden[j]] = [orden[j], orden[i]]
  }
  return orden
}

// El número de día según la fecha local de quien mira (a medianoche cambia el pensamiento).
export const numeroDeDia = (fecha: Date) => Math.floor((Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()) - ORIGEN) / DIA_MS)

export function indiceDelDia(dia: number, n: number): number {
  if (n <= 1) return 0
  if (n === 2) return ((dia % 2) + 2) % 2 // con dos, alternar es la única forma de no repetir
  const vuelta = Math.floor(dia / n)
  const lugar = ((dia % n) + n) % n
  const orden = ordenDeVuelta(vuelta, n)
  if (vuelta > 0) {
    const anterior = ordenDeVuelta(vuelta - 1, n)
    if (orden[0] === anterior[n - 1]) [orden[0], orden[1]] = [orden[1], orden[0]]
  }
  return orden[lugar]
}
