// Búsqueda sin distinguir mayúsculas ni tildes: «desilusion» encuentra «Desilusión».
export const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

export const coincide = (consulta: string, ...campos: string[]) => {
  const q = normalizar(consulta)
  return !q || campos.some((c) => normalizar(c).includes(q))
}
