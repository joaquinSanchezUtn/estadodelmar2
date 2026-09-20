import { normalizar } from './buscar'

// «Sentido de la vida» -> «sentido-de-la-vida»: la dirección que se sugiere a partir del título.
export const aSlug = (titulo: string) =>
  normalizar(titulo)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
