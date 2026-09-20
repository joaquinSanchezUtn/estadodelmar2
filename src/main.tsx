import { MotionConfig } from 'motion/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { SesionProvider } from './auth/SesionContext'
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
