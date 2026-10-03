// Lo fijo del pedido. Las ocho ventanas (Mar en calma, Tormenta…) vivieron acá hasta la migración 0015: ahora
// son la tabla `estados` y la dueña las edita desde el panel.
import type { Enfoque, EstiloId } from './tipos'

// Los ocho aspectos que puede llevar una ventana (color de la tarjeta y dibujo animado). El nombre es para
// el selector del panel: se llaman como la ventana original que los estrenó, más el color.
export const estilos: { id: EstiloId; nombre: string }[] = [
  { id: 'calma', nombre: 'Mar en calma · aguamarina' },
  { id: 'olas_suaves', nombre: 'Olas suaves · verde' },
  { id: 'agitado', nombre: 'Mar agitado · azul' },
  { id: 'tormenta', nombre: 'Tormenta · gris' },
  { id: 'profundidades', nombre: 'Profundidades · azul pizarra' },
  { id: 'mareas', nombre: 'Mareas · lila' },
  { id: 'corrientes', nombre: 'Corrientes · celeste' },
  { id: 'horizonte', nombre: 'Horizonte · arena' },
]

// Los tres enfoques de un tema: parte fija del pedido, no una tabla.
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
