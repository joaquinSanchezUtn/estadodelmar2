// 75 -> '1:15'; 3725 -> '1:02:05'. Para el reloj del reproductor.
export const reloj = (segundos: number) => {
  const s = Math.max(0, Math.floor(Number.isFinite(segundos) ? segundos : 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const dos = (n: number) => String(n).padStart(2, '0')
  return h ? `${h}:${dos(m)}:${dos(s % 60)}` : `${m}:${dos(s % 60)}`
}

// 5242880 -> '5 MB'. Para el tamaño de un archivo.
export const tamano = (bytes: number) =>
  bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(1)} GB` : bytes >= 1024 ** 2 ? `${Math.round(bytes / 1024 ** 2)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`

export const minutos = (m: number | null) => (m ? `${m} min` : '')

// '2026-10-05' -> '5 de octubre de 2026'. Se fija el mediodía para evitar corrimientos de zona horaria.
export const fechaLarga = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

// "3 piezas · 40 min": cuántas piezas tiene la ventana y cuánto dura todo. Solo usa lo público.
export const resumenPiezas = (piezas: { duracionMin: number | null }[]) => {
  const total = piezas.reduce((suma, p) => suma + (p.duracionMin ?? 0), 0)
  const n = `${piezas.length} ${piezas.length === 1 ? 'pieza' : 'piezas'}`
  return total ? `${n} · ${total} min` : n
}
