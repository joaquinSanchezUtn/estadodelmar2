// DATOS DE PRUEBA — un audio de silencio generado en el navegador, para poder probar el reproductor
// sin ningún archivo. Con Bunny Stream, la URL firmada la devuelve una Edge Function.
export function silencioWav(segundos = 30): string {
  const tasa = 8000
  const bytes = segundos * tasa
  const datos = new Uint8Array(44 + bytes).fill(128) // 128 = silencio en 8 bits sin signo
  const vista = new DataView(datos.buffer)
  const texto = (pos: number, s: string) => [...s].forEach((c, i) => vista.setUint8(pos + i, c.charCodeAt(0)))
  texto(0, 'RIFF')
  vista.setUint32(4, 36 + bytes, true)
  texto(8, 'WAVEfmt ')
  vista.setUint32(16, 16, true)
  vista.setUint16(20, 1, true) // PCM
  vista.setUint16(22, 1, true) // mono
  vista.setUint32(24, tasa, true)
  vista.setUint32(28, tasa, true)
  vista.setUint16(32, 1, true)
  vista.setUint16(34, 8, true)
  texto(36, 'data')
  vista.setUint32(40, bytes, true)
  return URL.createObjectURL(new Blob([datos], { type: 'audio/wav' }))
}
