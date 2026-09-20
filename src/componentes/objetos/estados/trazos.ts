// Generadores de trazos SVG para los dibujos de estado. Todos dibujan sobre un lienzo
// de 200 de ancho pero se extienden a 400: el dibujo se desplaza un período entero y el
// bucle no tiene corte.

// Onda regular: `periodo` de largo, `amplitud` de alto, centrada en `y`.
export function onda(y: number, amplitud: number, periodo: number, largo = 400) {
  const mitad = periodo / 2
  let d = `M0 ${y} q${mitad / 2} ${-amplitud} ${mitad} 0`
  for (let x = mitad; x < largo; x += mitad) d += ` t${mitad} 0`
  return d
}

// Ondas desparejas: un patrón de [ancho, alto] que se repite hasta cubrir el largo.
export function irregular(y: number, patron: [number, number][], largo = 400) {
  let d = `M0 ${y}`
  let x = 0
  while (x < largo) {
    for (const [ancho, alto] of patron) {
      d += ` q${ancho / 2} ${alto} ${ancho} 0`
      x += ancho
    }
  }
  return d
}

// Línea quebrada: un patrón de [dx, dy] que se repite hasta cubrir el largo.
export function quebrada(y: number, patron: [number, number][], largo = 400) {
  let d = `M0 ${y}`
  let x = 0
  while (x < largo) {
    for (const [dx, dy] of patron) {
      d += ` l${dx} ${dy}`
      x += dx
    }
  }
  return d
}

// Clases del trazo: línea fina de grosor constante aunque el dibujo se escale.
export const trazo = 'fill-none stroke-mar-agua stroke-[1.5] [vector-effect:non-scaling-stroke] [stroke-linecap:round] [stroke-linejoin:round]'
