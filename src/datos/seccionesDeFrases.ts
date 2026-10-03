// Las dos secciones de frases del día: misma mecánica (una por día, rotación sin repetir, carga desde el
// panel), distinta tabla, nombre y costado de la pantalla.
//
// Ojo con los nombres de tabla: las Semillas viven en `ecos` porque la sección se llamó "Ecos del océano"
// unas horas (migración 0013) antes de llamarse "Semillas del mar"; la sección que hoy se llama "Ecos del
// océano" vive en `ecos_del_oceano` (migración 0014).
export type SeccionDeFrases = 'semillas' | 'ecos'

type Config = {
  tabla: 'ecos' | 'ecos_del_oceano'
  titulo: string
  singular: string
  plural: string
  femenino: boolean
  ruta: string
  lado: 'derecha' | 'izquierda'
  // localStorage, para el puntito de "todavía no la viste hoy".
  claveVista: string
}

export const SECCIONES_DE_FRASES: Record<SeccionDeFrases, Config> = {
  semillas: {
    tabla: 'ecos',
    titulo: 'Semillas del mar',
    singular: 'semilla',
    plural: 'semillas',
    femenino: true,
    ruta: '/admin/semillas',
    lado: 'derecha',
    // Conserva el nombre de cuando era "Pensamiento del día": así los cambios de nombre no prendieron el puntito.
    claveVista: 'estado-del-mar:pensamiento-visto',
  },
  ecos: {
    tabla: 'ecos_del_oceano',
    titulo: 'Ecos del océano',
    singular: 'eco',
    plural: 'ecos',
    femenino: false,
    ruta: '/admin/ecos',
    lado: 'izquierda',
    claveVista: 'marea-interior:eco-visto',
  },
}

// Concordancia de género en los textos: g(config, 'una', 'un').
export const g = (c: Config, femenino: string, masculino: string) => (c.femenino ? femenino : masculino)
