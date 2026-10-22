import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'

// Chaque déploiement remplace l'image nginx : les chunks de l'ancienne version
// disparaissent, et un onglet ouvert avant la mise en ligne ne peut plus charger
// la page suivante. On recharge pour récupérer le nouvel index.html — une fois
// par tranche de 10 s, pour ne pas boucler si le chunk manque vraiment.
const CHUNK_RELOAD_KEY = 'lagrenaille_chunk_reload'
window.addEventListener('vite:preloadError', () => {
  try {
    const last = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY)) || 0
    if (Date.now() - last < 10_000) return
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()))
  } catch {
    return
  }
  window.location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
