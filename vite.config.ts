import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Los archivos generados van a `assets/` con el hash separado por un punto (`index.Ab12.css`), no por un
// guion como trae Vite. Se cambió el 2026-10-03 para que todos los nombres cambiaran una vez: hasta ese día
// Vercel servía `/assets/*` con caché de un año, y algún navegador se había guardado la página HTML en lugar
// del CSS (ver `vercel.json`). Con nombres nuevos, nadie vuelve a pedir un archivo envenenado.
const nombre = 'assets/[name].[hash]'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: { entryFileNames: `${nombre}.js`, chunkFileNames: `${nombre}.js`, assetFileNames: `${nombre}.[ext]` },
    },
  },
})
