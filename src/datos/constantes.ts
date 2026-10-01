// Los ocho estados del mar: no son una tabla (ver CLAUDE.md, "La metáfora marina"), son parte fija
// de la metáfora. Viven acá, no en mock.ts, porque no son un dato de prueba: están en todo build.
import type { Enfoque, EstadoMar } from './tipos'

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

// Los tres enfoques de un tema. Como los estados, son parte fija del pedido: no una tabla.
export const enfoques: Enfoque[] = [
  { id: 'psicologico', nombre: 'Psicológico', descripcion: 'Emociones, vínculos y conflictos de la vida cotidiana' },
  { id: 'filosofico', nombre: 'Filosófico', descripcion: 'El sentido, el propósito y la manera de vivir' },
  { id: 'transpersonal', nombre: 'Transpersonal y espiritual', descripcion: 'Más allá de la personalidad: la conciencia y el Ser' },
]

// Lo que trae el plan: solo lo que el sitio ya hace, nada prometido de más. Lo usan Mi cuenta y la invitación de cada tema.
export const incluyeElPlan = [
  'Todos los temas, y los que se vayan sumando.',
  'En cada tema: un video, una meditación guiada y una ejercitación.',
  'A tu ritmo, desde el celular o la compu.',
]
