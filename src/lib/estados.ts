import type { EstadoMarId } from '../datos/tipos'

// En la URL los estados van con guion (/estado/olas-suaves); en los datos, con guion bajo.
export const urlDeEstado = (id: EstadoMarId) => `/estado/${id.replace('_', '-')}`
export const estadoDeUrl = (param: string | undefined) => (param ?? '').replace('-', '_')
