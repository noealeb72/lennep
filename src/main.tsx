import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import './index.css'
import { initColorSchemeFromStorage } from './components/ColorSchemeToggle'
import { AppRouter } from './routing/AppRouter'

initColorSchemeFromStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
