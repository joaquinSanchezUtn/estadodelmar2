// Achica la foto en el navegador antes de subirla: una foto de celular pesa varios MB y tiene más píxeles de
// los que una tarjeta va a mostrar nunca. Lado mayor de hasta 1600 px, en WebP (JPEG si el navegador no sabe
// escribir WebP). Si la foto ya es chica, igual pasa por acá: así se va lo que traiga adentro (por ejemplo,
// la ubicación GPS de los datos EXIF).
const LADO_MAXIMO = 1600

const aBlob = (lienzo: HTMLCanvasElement, tipo: string) =>
  new Promise<Blob | null>((listo) => lienzo.toBlob(listo, tipo, 0.85))

export async function prepararFoto(archivo: File): Promise<Blob> {
  const imagen = await createImageBitmap(archivo)
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height))
  const lienzo = document.createElement('canvas')
  lienzo.width = Math.round(imagen.width * escala)
  lienzo.height = Math.round(imagen.height * escala)
  lienzo.getContext('2d')?.drawImage(imagen, 0, 0, lienzo.width, lienzo.height)
  imagen.close()
  const webp = await aBlob(lienzo, 'image/webp')
  if (webp?.type === 'image/webp') return webp
  const jpeg = await aBlob(lienzo, 'image/jpeg')
  if (!jpeg) throw new Error('No se pudo preparar la foto.')
  return jpeg
}
