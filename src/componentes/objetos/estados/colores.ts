import type { EstadoMarId } from '../../../datos/tipos'

// Clases de color de cada estado del mar, escritas completas: Tailwind solo genera las que
// ve literalmente en el código, así que no se pueden armar con plantillas de texto.
export type ColoresEstado = {
  fondo: string // fondo de la tarjeta
  borde: string // borde de la tarjeta
  agua: string // agua de adentro del ojo de buey (nunca blanca)
  linea: string // color del dibujo (text-* porque el trazo usa currentColor)
  aro: string // anillo de 3px, el tono más oscuro del estado
  aroExterior: string // anillo de 1px por fuera del aro
  aroClaro: string // el mismo tono claro como borde (al enfocar el aro se aclara)
  cielo: string // relleno de mar: el cielo, de arriba hacia el horizonte
  olaTrasera: string // relleno de mar: capa de ola de atrás
  olaDelantera: string // relleno de mar: capa de ola de adelante
  agitacion: number // qué tan movido está el mar (alto de las olas del relleno)
}

export const coloresEstado: Record<EstadoMarId, ColoresEstado> = {
  calma: {
    fondo: 'bg-estado-calma-fondo',
    borde: 'border-estado-calma-aroClaro',
    agua: 'bg-estado-calma-agua',
    linea: 'text-estado-calma-linea',
    aro: 'border-estado-calma-aro',
    aroExterior: 'ring-estado-calma-aroClaro',
    aroClaro: 'border-estado-calma-aroClaro',
    cielo: 'bg-gradient-to-b from-estado-calma-fondo to-estado-calma-agua',
    olaTrasera: 'fill-estado-calma-aroClaro',
    olaDelantera: 'fill-estado-calma-aro/30',
    agitacion: 1.4,
  },
  olas_suaves: {
    fondo: 'bg-estado-olasSuaves-fondo',
    borde: 'border-estado-olasSuaves-aroClaro',
    agua: 'bg-estado-olasSuaves-agua',
    linea: 'text-estado-olasSuaves-linea',
    aro: 'border-estado-olasSuaves-aro',
    aroExterior: 'ring-estado-olasSuaves-aroClaro',
    aroClaro: 'border-estado-olasSuaves-aroClaro',
    cielo: 'bg-gradient-to-b from-estado-olasSuaves-fondo to-estado-olasSuaves-agua',
    olaTrasera: 'fill-estado-olasSuaves-aroClaro',
    olaDelantera: 'fill-estado-olasSuaves-aro/30',
    agitacion: 3,
  },
  agitado: {
    fondo: 'bg-estado-agitado-fondo',
    borde: 'border-estado-agitado-aroClaro',
    agua: 'bg-estado-agitado-agua',
    linea: 'text-estado-agitado-linea',
    aro: 'border-estado-agitado-aro',
    aroExterior: 'ring-estado-agitado-aroClaro',
    aroClaro: 'border-estado-agitado-aroClaro',
    cielo: 'bg-gradient-to-b from-estado-agitado-fondo to-estado-agitado-agua',
    olaTrasera: 'fill-estado-agitado-aroClaro',
    olaDelantera: 'fill-estado-agitado-aro/30',
    agitacion: 4.6,
  },
  tormenta: {
    fondo: 'bg-estado-tormenta-fondo',
    borde: 'border-estado-tormenta-aroClaro',
    agua: 'bg-estado-tormenta-agua',
    linea: 'text-estado-tormenta-linea',
    aro: 'border-estado-tormenta-aro',
    aroExterior: 'ring-estado-tormenta-aroClaro',
    aroClaro: 'border-estado-tormenta-aroClaro',
    cielo: 'bg-gradient-to-b from-estado-tormenta-fondo to-estado-tormenta-agua',
    olaTrasera: 'fill-estado-tormenta-aroClaro',
    olaDelantera: 'fill-estado-tormenta-aro/30',
    agitacion: 6.5,
  },
  profundidades: {
    fondo: 'bg-estado-profundidades-fondo',
    borde: 'border-estado-profundidades-aroClaro',
    agua: 'bg-estado-profundidades-agua',
    linea: 'text-estado-profundidades-linea',
    aro: 'border-estado-profundidades-aro',
    aroExterior: 'ring-estado-profundidades-aroClaro',
    aroClaro: 'border-estado-profundidades-aroClaro',
    cielo: 'bg-gradient-to-b from-estado-profundidades-fondo to-estado-profundidades-agua',
    olaTrasera: 'fill-estado-profundidades-aroClaro',
    olaDelantera: 'fill-estado-profundidades-aro/30',
    agitacion: 1.4,
  },
  mareas: {
    fondo: 'bg-estado-mareas-fondo',
    borde: 'border-estado-mareas-aroClaro',
    agua: 'bg-estado-mareas-agua',
    linea: 'text-estado-mareas-linea',
    aro: 'border-estado-mareas-aro',
    aroExterior: 'ring-estado-mareas-aroClaro',
    aroClaro: 'border-estado-mareas-aroClaro',
    cielo: 'bg-gradient-to-b from-estado-mareas-fondo to-estado-mareas-agua',
    olaTrasera: 'fill-estado-mareas-aroClaro',
    olaDelantera: 'fill-estado-mareas-aro/30',
    agitacion: 3,
  },
  corrientes: {
    fondo: 'bg-estado-corrientes-fondo',
    borde: 'border-estado-corrientes-aroClaro',
    agua: 'bg-estado-corrientes-agua',
    linea: 'text-estado-corrientes-linea',
    aro: 'border-estado-corrientes-aro',
    aroExterior: 'ring-estado-corrientes-aroClaro',
    aroClaro: 'border-estado-corrientes-aroClaro',
    cielo: 'bg-gradient-to-b from-estado-corrientes-fondo to-estado-corrientes-agua',
    olaTrasera: 'fill-estado-corrientes-aroClaro',
    olaDelantera: 'fill-estado-corrientes-aro/30',
    agitacion: 3.4,
  },
  horizonte: {
    fondo: 'bg-estado-horizonte-fondo',
    borde: 'border-estado-horizonte-aroClaro',
    agua: 'bg-estado-horizonte-agua',
    linea: 'text-estado-horizonte-linea',
    aro: 'border-estado-horizonte-aro',
    aroExterior: 'ring-estado-horizonte-aroClaro',
    aroClaro: 'border-estado-horizonte-aroClaro',
    cielo: 'bg-gradient-to-b from-estado-horizonte-fondo to-estado-horizonte-agua',
    olaTrasera: 'fill-estado-horizonte-aroClaro',
    olaDelantera: 'fill-estado-horizonte-aro/30',
    agitacion: 1,
  },
}

// Un tema sin estado usa el de la calma.
export const coloresDe = (estado: EstadoMarId | null) => coloresEstado[estado ?? 'calma']
