import type { Tema } from '../datos/tipos'

// Si hay al menos una meditación publicada (sale de `temas.piezas`, lo público). Decide si se muestran el
// enlace "Meditaciones" del menú y la franja nocturna de la home.
export const hayMeditaciones = (temas: Tema[] | null) => !!temas?.some((t) => t.piezas.some((p) => p.tipo === 'meditacion'))
