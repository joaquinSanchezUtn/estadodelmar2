import type { EstadoId } from './estados'

export type Tema = {
  slug: string
  titulo: string
  descripcion: string
  estado: EstadoId
}

// Datos de ejemplo del prototipo. Se reemplazan por la tabla `temas` de Supabase.
export const temas: Tema[] = [
  {
    slug: 'ansiedad',
    titulo: 'Ansiedad',
    descripcion: 'Qué la sostiene y cómo bajar el oleaje sin pelearse con él.',
    estado: 'agitado',
  },
  {
    slug: 'control',
    titulo: 'Control',
    descripcion: 'Querer que las cosas y las personas sean como uno cree que deben ser.',
    estado: 'corrientes',
  },
  {
    slug: 'desilusion',
    titulo: 'Desilusión',
    descripcion: 'Cuando lo que esperábamos no llegó, y hay que seguir igual.',
    estado: 'tormenta',
  },
  {
    slug: 'sentido-de-la-vida',
    titulo: 'Sentido de la vida',
    descripcion: 'La pregunta que vuelve cuando el ruido baja.',
    estado: 'horizonte',
  },
  {
    slug: 'crianza',
    titulo: 'Crianza de hijos',
    descripcion: 'Acompañar sin quedarse sin uno mismo en el camino.',
    estado: 'olas_suaves',
  },
  {
    slug: 'pareja',
    titulo: 'Pareja',
    descripcion: 'Lo que se repite sin que nadie lo haya elegido.',
    estado: 'corrientes',
  },
  {
    slug: 'desapego',
    titulo: 'Desapego',
    descripcion: 'Soltar sin que sea indiferencia.',
    estado: 'profundidades',
  },
]
