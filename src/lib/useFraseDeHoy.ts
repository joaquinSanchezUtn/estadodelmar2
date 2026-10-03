import { listarFrases } from '../datos/frases'
import type { SeccionDeFrases } from '../datos/seccionesDeFrases'
import { indiceDelDia, numeroDeDia } from './fraseDelDia'
import { useCarga } from './useCarga'

// La frase de hoy de una sección (la de Semillas es la misma en la pestaña del costado y en Mi cuenta).
// `null` mientras carga, si falla o si la sección no tiene ninguna publicada: quien la usa no la muestra.
export function useFraseDeHoy(seccion: SeccionDeFrases): string | null {
  const { datos } = useCarga(`frases:${seccion}`, () => listarFrases(seccion), true)
  if (!datos?.length) return null
  return datos[indiceDelDia(numeroDeDia(new Date()), datos.length)]
}
