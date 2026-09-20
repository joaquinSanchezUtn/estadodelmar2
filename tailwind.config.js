/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Valores validados: burbujas a ≥5 pts de luminosidad del fondo y ≥6 entre contiguas;
        // texto a ≥4.5:1 sobre toda superficie (incluidas las ocho tarjetas de estado).
        mar: {
          nube: '#E0E8EE', // fondo de página: apenas más oscuro que las burbujas blancas
          blanco: '#FFFFFF', // burbujas y tarjetas blancas
          aguaClara: '#BEDAEF', // héroe
          cielo: '#BAD7EB', // ventanas
          espuma: '#BFDCEE', // suscripción y bloques destacados
          bordeAgua: '#8BADC6', // borde de 1px sobre blanco
          bordeCielo: '#79A4C3', // borde de 1px sobre burbujas tintadas
          tinta: '#152A37', // texto principal
          tintaSuave: '#314A5B', // texto secundario
          tintaTenue: '#3F5462', // enseñanzas, metadatos (pasa 4.5:1 en todas las superficies)
          celeste: '#6DB4E3', // botón primario (texto tintaBoton)
          celesteBorde: '#2970A3', // borde del botón primario: sin él se pierde contra las burbujas tintadas
          tintaBoton: '#0D2436', // texto sobre el botón primario
          coral: '#B0523A', // errores y avisos, texto sobre claro
          agua: '#184F77', // enlaces y acentos
          aguaSuave: '#88BADD', // bordes de cita, íconos
        },
        // Cada estado del mar tiene su matiz. Roles: fondo (tarjeta), agua (adentro del ojo de
        // buey), linea (el dibujo), aro (anillo de 3px) y aroClaro (anillo exterior de 1px).
        estado: {
          calma: { fondo: '#E3F8F6', agua: '#CDEFED', linea: '#1D6D6D', aro: '#2A7D7E', aroClaro: '#B6E2DF' },
          olasSuaves: { fondo: '#D1EBDB', agua: '#BADEC8', linea: '#1D5839', aro: '#296A49', aroClaro: '#A7D2B8' },
          agitado: { fondo: '#D1DFFA', agua: '#B3C9F5', linea: '#133176', aro: '#1D4090', aroClaro: '#A7BCE6' },
          tormenta: { fondo: '#D1D6DB', agua: '#BDC3CB', linea: '#2A3647', aro: '#384557', aroClaro: '#AFB6C0' },
          profundidades: { fondo: '#BDC6DB', agua: '#A2AFCD', linea: '#141D33', aro: '#23304D', aroClaro: '#97A3BF' },
          mareas: { fondo: '#E6DDEE', agua: '#D4C7E1', linea: '#472C63', aro: '#5C3D7B', aroClaro: '#C4B6D2' },
          corrientes: { fondo: '#BAE0E8', agua: '#9DD2DD', linea: '#104451', aro: '#1A5766', aroClaro: '#8DC3CE' },
          horizonte: { fondo: '#F3E4C9', agua: '#EBD4AD', linea: '#663D15', aro: '#7E5326', aroClaro: '#DBC39E' },
        },
      },
      // ─── La escala ───────────────────────────────────────────────────────────────
      // Todo tamaño, radio, alto, ancho y capa sale de acá. `npm run escala` rechaza los
      // valores sueltos ([15px], rounded-xl, z-[60], p-1.5…). Si falta un nivel, se discute
      // y se agrega acá; no se inventa en el componente.
      //
      // Espaciado: múltiplos de 4px. Permitidos: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96
      // (clases 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 24). Sin medios pasos (0.5, 1.5, 2.5, 3.5).
      //
      // Tipografía: ocho niveles, con el interlineado adentro. Los títulos son Fraunces
      // (`font-titulo`, peso `font-light` desde titulo-l); el resto, Karla.
      fontSize: {
        etiqueta: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.16em', fontWeight: '500' }], // sobretítulos; con `uppercase`
        meta: ['0.875rem', { lineHeight: '1.25rem' }], // metadatos, pies, chips
        cuerpo: ['1rem', { lineHeight: '1.625rem' }], // texto corrido, botones, campos
        destacado: ['1.125rem', { lineHeight: '1.75rem' }], // bajadas y textos de apertura
        'titulo-s': ['1.25rem', { lineHeight: '1.75rem' }], // título de tarjeta
        'titulo-m': ['1.5rem', { lineHeight: '2rem' }], // título de sección en celular
        'titulo-l': ['2rem', { lineHeight: '2.5rem' }], // título de sección desde md
        'titulo-xl': ['clamp(2.5rem, 1.9rem + 2.4vw, 3.5rem)', { lineHeight: '1.1' }], // solo el h1 de portada (fluido: 40 → 56px)
      },
      borderRadius: {
        control: '12px', // campos, selects
        tarjeta: '16px', // tarjetas e ítems
        burbuja: '28px',
        burbujaGrande: '40px',
      },
      // Altos táctiles: 48px es el estándar; 44px, el mínimo permitido (encabezado, enlaces). El botón de reproducir es `size-12` (lista) o `size-16` (video).
      height: { control: '3rem', 'control-sm': '2.75rem' },
      minHeight: { control: '3rem', 'control-sm': '2.75rem' },
      borderWidth: { 3: '3px' }, // aro de los ojos de buey y filo de las citas
      // Anchos de página, con los 24px de respiro de cada lado adentro (`Pagina`): la burbuja mide
      // 48px menos (400, 720 y 1104). `parrafo` es el largo máximo de una línea de texto corrido.
      maxWidth: { angosto: '28rem', lectura: '48rem', ancho: '72rem', parrafo: '42rem', ojo: '10.5rem' },
      zIndex: { encabezado: '40', menu: '50', flotante: '60' },
      // Las sombras tienen que verse. El inset blanco de 1px es el reflejo del borde superior:
      // hace que las burbujas se lean como vidrio.
      boxShadow: {
        burbuja:
          'inset 0 1px 0 0 rgba(255,255,255,0.9), 0 1px 2px rgba(21,42,55,0.08), 0 10px 24px -8px rgba(21,42,55,0.16), 0 34px 70px -26px rgba(21,42,55,0.30)',
        tarjeta: 'inset 0 1px 0 0 rgba(255,255,255,0.7), 0 1px 2px rgba(21,42,55,0.08), 0 8px 20px -10px rgba(21,42,55,0.28)',
        ojo: '0 2px 4px rgba(21,42,55,0.12), 0 16px 30px -10px rgba(21,42,55,0.32)',
        ojoFoco: '0 24px 52px -12px rgba(21,42,55,0.45)',
        ventana: 'inset 0 3px 10px rgba(21,42,55,0.22)',
        elevada: '0 14px 40px -14px rgba(21,42,55,0.3)', // tarjeta enfocada
        encabezado: '0 1px 18px -8px rgba(21,42,55,0.2)', // encabezado con la página scrolleada
      },
      // Textura de papel: ruido fino (feTurbulence) que se repite; se usa con muy poca opacidad (Grano).
      backgroundImage: {
        grano:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='r'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .1 0 0 0 0 .16 0 0 0 0 .22 0 0 0 .9 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23r)'/%3E%3C/svg%3E\")",
      },
      opacity: { 4: '0.04' },
      fontFamily: {
        titulo: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Karla', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
