// DATOS DE PRUEBA — se borra cuando entra Supabase.
// Nadie importa este archivo salvo contenido.ts.
import type { Contenido, EstadoMar, EstadoMarId, Tema } from './tipos'

export const estados: EstadoMar[] = [
  {
    id: 'calma',
    nombre: 'Mar en calma',
    estadoInterno: 'Paz interior, serenidad, equilibrio',
    ensenanza: 'La mente clara ve la realidad con más objetividad',
  },
  {
    id: 'olas_suaves',
    nombre: 'Olas suaves',
    estadoInterno: 'Alegría, entusiasmo, curiosidad, tristeza pasajera',
    ensenanza: 'Las emociones son parte de la vida; se viven sin perder el equilibrio',
  },
  {
    id: 'agitado',
    nombre: 'Mar agitado',
    estadoInterno: 'Estrés, preocupación, ansiedad, enojo, miedo',
    ensenanza: 'Reaccionar impulsivamente impide ver con claridad',
  },
  {
    id: 'tormenta',
    nombre: 'Tormenta',
    estadoInterno: 'Crisis, pérdidas, conflictos, grandes desafíos',
    ensenanza: 'Las tormentas no duran para siempre',
  },
  {
    id: 'profundidades',
    nombre: 'Profundidades',
    estadoInterno: 'El Ser profundo, la conciencia, la esencia',
    ensenanza: 'Aunque la superficie esté turbulenta, abajo reina el silencio',
  },
  {
    id: 'mareas',
    nombre: 'Mareas',
    estadoInterno: 'Ciclos de energía, motivación, ánimo',
    ensenanza: 'Todo tiene ritmos; respetarlos favorece el bienestar',
  },
  {
    id: 'corrientes',
    nombre: 'Corrientes',
    estadoInterno: 'Creencias, hábitos, condicionamientos',
    ensenanza: 'Influyen en nuestra dirección sin que lo notemos',
  },
  {
    id: 'horizonte',
    nombre: 'Horizonte',
    estadoInterno: 'Propósito, sentido de vida, trascendencia',
    ensenanza: 'Mirar el horizonte evita quedar atrapado en la ola del momento',
  },
]

// Cada tema con sus tres piezas: [título, minutos] y la consigna de la ejercitación.
type Semilla = {
  slug: string
  titulo: string
  descripcion: string
  estadoMar: EstadoMarId
  publicado?: boolean
  video: [string, number]
  meditacion: [string, number]
  ejercitacion: [string, number, string]
}

const semillas: Semilla[] = [
  {
    slug: 'ansiedad',
    titulo: 'Ansiedad',
    descripcion: 'Qué la sostiene y cómo bajar el oleaje sin pelearse con él.',
    estadoMar: 'agitado',
    video: ['Qué sostiene la ansiedad', 18],
    meditacion: ['Volver al fondo', 12],
    ejercitacion: [
      'Tres notas antes de reaccionar',
      10,
      'Durante los próximos siete días, cuando aparezca la ola, anotá tres cosas antes de reaccionar: qué pasó, qué sentiste en el cuerpo y qué necesitabas en ese momento.',
    ],
  },
  {
    slug: 'control',
    titulo: 'Control',
    descripcion: 'Querer que las cosas y las personas sean como uno cree que deben ser.',
    estadoMar: 'corrientes',
    video: ['El esfuerzo de sostener el control', 16],
    meditacion: ['Aflojar las manos', 10],
    ejercitacion: [
      'Lo que depende de mí',
      15,
      'Hacé dos columnas. En una escribí lo que hoy te preocupa y depende de vos; en la otra, lo que no. Elegí una sola cosa de la primera columna y dedicale la próxima hora.',
    ],
  },
  {
    slug: 'desilusion',
    titulo: 'Desilusión',
    descripcion: 'Cuando lo que esperábamos no llegó, y hay que seguir igual.',
    estadoMar: 'tormenta',
    video: ['Lo que queda cuando algo no llega', 20],
    meditacion: ['Quedarse en el fondo', 14],
    ejercitacion: [
      'Una carta que no se envía',
      20,
      'Escribí una carta a lo que esperabas: qué te daba, qué le agradecés y qué soltás. No la envíes ni la releas hoy; guardala y volvé a ella dentro de una semana.',
    ],
  },
  {
    slug: 'sentido-de-la-vida',
    titulo: 'Sentido de la vida',
    descripcion: 'La pregunta que vuelve cuando el ruido baja.',
    estadoMar: 'horizonte',
    video: ['Mirar hacia el horizonte', 22],
    meditacion: ['El horizonte desde adentro', 15],
    ejercitacion: [
      'Un día que valió la pena',
      15,
      'Recordá un día reciente en el que te sentiste pleno. Anotá qué hacías, con quién estabas y qué de todo eso te importaba. Repetilo con otros dos días y buscá qué se repite.',
    ],
  },
  {
    slug: 'crianza',
    titulo: 'Crianza de hijos',
    descripcion: 'Acompañar sin quedarse sin uno mismo en el camino.',
    estadoMar: 'olas_suaves',
    video: ['Acompañar sin absorberse', 17],
    meditacion: ['Respirar antes de responder', 10],
    ejercitacion: [
      'Cinco minutos sin agenda',
      15,
      'Elegí un momento de esta semana para estar cinco minutos con tu hijo o hija, sin pantallas ni objetivos. Al terminar, anotá qué notaste de esa persona que antes no habías visto.',
    ],
  },
  {
    slug: 'pareja',
    titulo: 'Pareja',
    descripcion: 'Lo que se repite sin que nadie lo haya elegido.',
    estadoMar: 'corrientes',
    video: ['Los guiones que repetimos', 19],
    meditacion: ['Escuchar sin preparar la respuesta', 12],
    ejercitacion: [
      'La misma discusión',
      15,
      'Pensá en una discusión que vuelve. Escribí qué pasa primero, qué sentís vos en ese momento y qué creencia sobre vos o sobre el otro aparece. Solo observá; no hace falta resolver nada.',
    ],
  },
  {
    slug: 'armonia-familiar',
    titulo: 'Armonía familiar',
    descripcion: 'Convivir con las diferencias sin perder el eje.',
    estadoMar: 'olas_suaves',
    video: ['Lo que cada uno trae a la mesa', 17],
    meditacion: ['Presencia compartida', 10],
    ejercitacion: [
      'Un acuerdo pequeño',
      15,
      'Elegí un solo acuerdo cotidiano con tu familia —un horario, una tarea, un momento— y proponelo con calma. Anotá cómo respondió cada persona, sin corregir a nadie.',
    ],
  },
  {
    slug: 'desapego',
    titulo: 'Desapego',
    descripcion: 'Soltar sin que sea indiferencia.',
    estadoMar: 'profundidades',
    video: ['Soltar sin dejar de querer', 18],
    meditacion: ['Abrir la mano', 13],
    ejercitacion: [
      'Algo que sostengo de más',
      10,
      'Elegí algo que venís sosteniendo con esfuerzo: una idea, un plan, un vínculo. Preguntate qué pasaría si lo sostuvieras con la mano abierta, sin apretar.',
    ],
  },
  {
    // Borrador: no aparece en el catálogo público.
    slug: 'miedos',
    titulo: 'Miedos',
    descripcion: 'Reconocer qué cuida el miedo antes de intentar callarlo.',
    estadoMar: 'agitado',
    publicado: false,
    video: ['Qué cuida el miedo', 16],
    meditacion: ['Acompañar el miedo', 11],
    ejercitacion: [
      'Ponerle nombre',
      10,
      'Cuando aparezca un miedo, ponele nombre en una frase: «tengo miedo de…». Después escribí qué está queriendo cuidar. No hace falta hacer nada más.',
    ],
  },
]

const piezasDe = (s: Semilla): Contenido[] => [
  { id: `${s.slug}-video`, temaId: s.slug, tipo: 'video', titulo: s.video[0], cuerpo: null, duracionMin: s.video[1], publicado: true, orden: 1 },
  { id: `${s.slug}-meditacion`, temaId: s.slug, tipo: 'meditacion', titulo: s.meditacion[0], cuerpo: null, duracionMin: s.meditacion[1], publicado: true, orden: 2 },
  { id: `${s.slug}-ejercitacion`, temaId: s.slug, tipo: 'ejercitacion', titulo: s.ejercitacion[0], cuerpo: s.ejercitacion[2], duracionMin: s.ejercitacion[1], publicado: true, orden: 3 },
]

export const contenidos: Contenido[] = semillas.flatMap(piezasDe)

export const temas: Tema[] = semillas.map((s, i) => ({
  id: s.slug,
  slug: s.slug,
  titulo: s.titulo,
  descripcion: s.descripcion,
  estadoMar: s.estadoMar,
  publicado: s.publicado ?? true,
  orden: i + 1,
  piezas: piezasDe(s).map(({ tipo, duracionMin }) => ({ tipo, duracionMin })),
}))
