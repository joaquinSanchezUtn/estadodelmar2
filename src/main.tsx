import { MotionConfig } from 'motion/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { SesionProvider } from './auth/SesionContext'
// Las tipografías se sirven desde el propio sitio (no desde Google Fonts): así Google no recibe la IP
// de cada visita y la CSP no necesita abrirle la puerta. Akaya Kanadaka para los títulos (desde el 2026-10-03,
// antes Fraunces): solo el subconjunto latino (con eñes y tildes), que es lo único que usa el sitio.
import '@fontsource/akaya-kanadaka/latin.css'
import '@fontsource/akaya-kanadaka/latin-ext.css'
import '@fontsource-variable/nunito/wght.css'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SesionProvider>
        {/* reducedMotion="user": con prefers-reduced-motion se apagan transform y layout */}
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
      </SesionProvider>
    </BrowserRouter>
  </StrictMode>,
)
