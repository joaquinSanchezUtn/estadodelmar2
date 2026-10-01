import { MotionConfig } from 'motion/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { SesionProvider } from './auth/SesionContext'
// Las tipografías se sirven desde el propio sitio (no desde Google Fonts): así Google no recibe la IP
// de cada visita y la CSP no necesita abrirle la puerta. Fraunces completa (opsz, wght y SOFT).
import '@fontsource-variable/fraunces/full.css'
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
