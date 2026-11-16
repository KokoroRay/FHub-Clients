import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Auto-reload on deployment chunk mismatch with throttle guard and cache-busting
window.addEventListener('vite:preloadError', (event) => {
  console.warn('New deployment chunk mismatch detected:', event)
  const reloadKey = 'fhub_chunk_reload_timestamp'
  const lastReload = Number(sessionStorage.getItem(reloadKey) || 0)
  const now = Date.now()

  // Throttle: reload at most once every 15 seconds to avoid freezing the browser in an infinite loop
  if (now - lastReload > 15000) {
    sessionStorage.setItem(reloadKey, String(now))
    // Append or update cache-buster timestamp parameter to force getting newest index.html & fresh chunk URLs
    const url = new URL(window.location.href)
    url.searchParams.set('_v', String(now))
    window.location.replace(url.toString())
  } else {
    console.error('Repeated chunk load failure. Halting reload loop to allow ErrorBoundary fallback.')
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
