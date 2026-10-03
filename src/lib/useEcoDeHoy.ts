import { listarEcos } from '../datos/ecos'
import { indiceDelDia, numeroDeDia } from './ecoDelDia'
import { useCarga } from './useCarga'

// El eco de hoy, el mismo en la pestaña del costado y en Mi cuenta. `null` mientras carga o si falla:
// quien lo usa simplemente no lo muestra.
export function useEcoDeHoy(): string | null {
  const { datos } = useCarga('ecos', listarEcos, true)
  if (!datos?.length) return null
  return datos[indiceDelDia(numeroDeDia(new Date()), datos.length)]
}
