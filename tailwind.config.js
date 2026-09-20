/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mar: {
          nube: '#F6FAFD', // fondo general
          aguaClara: '#EEF6FB', // sección fría, muy clara
          cielo: '#E3F0F8', // sección celeste
          espuma: '#D9ECF7', // bloque destacado
          blanco: '#FFFFFF', // tarjetas
          bordeCielo: '#CFE1EE',
          bordeAgua: '#C6DDEB',
          tinta: '#1E3A4C', // texto principal
          tintaSuave: '#4A6478', // texto secundario
          tintaTenue: '#5F7788', // pies, metadatos (solo desde 14px)
          celeste: '#72B7E0', // botón primario (texto tintaBoton)
          tintaBoton: '#143247', // texto sobre el botón primario
          coral: '#B0523A', // errores y avisos, texto sobre claro
          agua: '#2A6A96', // enlaces y acentos
          aguaSuave: '#9CCBE6', // bordes de cita, íconos
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
