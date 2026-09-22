// Los ocho estados del mar: no son una tabla (ver CLAUDE.md, "La metáfora marina"), son parte fija
// de la metáfora. Viven acá, no en mock.ts, porque no son un dato de prueba: están en todo build.
import type { EstadoMar } from './tipos'

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
