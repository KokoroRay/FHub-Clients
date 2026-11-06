import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Auto-reload on deployment chunk mismatch
window.addEventListener('vite:preloadError', (event) => {
  console.warn('New deployment detected, reloading to load fresh chunks...', event)
  window.location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
