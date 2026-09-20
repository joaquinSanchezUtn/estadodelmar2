// Los ocho estados del mar. Los ids coinciden con el CHECK de temas.estado_mar.
export type EstadoId =
  | 'calma'
  | 'olas_suaves'
  | 'agitado'
  | 'tormenta'
  | 'profundidades'
  | 'mareas'
  | 'corrientes'
  | 'horizonte'

export type Estado = {
  id: EstadoId
  nombre: string
  resumen: string
  ensenanza: string
}

export const estados: Estado[] = [
  {
    id: 'calma',
    nombre: 'Mar en calma',
    resumen: 'Paz interior, serenidad, equilibrio.',
    ensenanza: 'La mente clara ve la realidad con más objetividad.',
  },
  {
    id: 'olas_suaves',
    nombre: 'Olas suaves',
    resumen: 'Alegría, entusiasmo, curiosidad, tristeza pasajera.',
    ensenanza: 'Las emociones son parte de la vida; se viven sin perder el equilibrio.',
  },
  {
    id: 'agitado',
    nombre: 'Mar agitado',
    resumen: 'Estrés, preocupación, ansiedad, enojo, miedo.',
    ensenanza: 'Reaccionar impulsivamente impide ver con claridad.',
  },
  {
    id: 'tormenta',
    nombre: 'Tormenta',
    resumen: 'Crisis, pérdidas, conflictos, grandes desafíos.',
    ensenanza: 'Las tormentas no duran para siempre.',
  },
  {
    id: 'profundidades',
    nombre: 'Profundidades',
    resumen: 'El Ser profundo, la conciencia, la esencia.',
    ensenanza: 'Aunque la superficie esté turbulenta, abajo reina el silencio.',
  },
  {
    id: 'mareas',
    nombre: 'Mareas',
    resumen: 'Ciclos de energía, motivación y ánimo.',
    ensenanza: 'Todo tiene ritmos; respetarlos favorece el bienestar.',
  },
  {
    id: 'corrientes',
    nombre: 'Corrientes',
    resumen: 'Creencias, hábitos y condicionamientos.',
    ensenanza: 'Influyen en nuestra dirección sin que lo notemos.',
  },
  {
    id: 'horizonte',
    nombre: 'El horizonte',
    resumen: 'Propósito, sentido de vida, trascendencia.',
    ensenanza: 'Mirar el horizonte evita quedar atrapado en la ola del momento.',
  },
]

export function estadoPorId(id: EstadoId): Estado {
  return estados.find((e) => e.id === id)!
}
