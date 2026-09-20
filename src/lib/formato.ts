export const minutos = (m: number | null) => (m ? `${m} min` : '')

// '2026-10-05' -> '5 de octubre de 2026'. Se fija el mediodía para evitar corrimientos de zona horaria.
export const fechaLarga = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
