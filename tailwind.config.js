/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mar: {
          marfil: '#FBFAF6', // fondo general
          arenaClara: '#F6F1E8', // sección cálida
          aguaClara: '#F1F5F4', // sección fría
          espuma: '#EEF4F3', // bloque destacado frío
          blanco: '#FFFFFF', // tarjetas
          bordeArena: '#E3DFD3',
          bordeAgua: '#DCE7E4',
          tinta: '#2C444D', // texto principal
          tintaSuave: '#556E77', // texto secundario
          tintaTenue: '#6B8188', // pies, metadatos (solo desde 14px)
          arena: '#D9A461', // botón primario (texto #2A3E45)
          arenaOscura: '#A8703A', // texto sobre claro
          agua: '#3B7B72', // enlaces y acentos
          aguaSuave: '#8FBDB4', // bordes de cita, íconos
        },
      },
      fontFamily: {
        titulo: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Karla', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
