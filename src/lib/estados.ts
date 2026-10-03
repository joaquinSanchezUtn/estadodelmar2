import type { EstadoMarId } from '../datos/tipos'

// En la URL las ventanas van con guiones (/estado/olas-suaves); en los datos, con guiones bajos. Todos, no
// solo el primero: una ventana nueva puede tener varios (mar_de_fondo).
export const urlDeEstado = (id: EstadoMarId) => `/estado/${id.replaceAll('_', '-')}`
export const estadoDeUrl = (param: string | undefined) => (param ?? '').replaceAll('-', '_')
