import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import App from '../App'
import { LocaleProvider, headerRegionFromNavigator } from '../locale/LocaleContext'
import { langParamFromRegion, regionFromLangParam } from './localePaths'
import type { AppLocale, HeaderRegion } from '../locale/types'
import { SitePathsProvider } from './SitePathsContext'

function RootRedirect() {
  const navigate = useNavigate()
  useEffect(() => {
    const r = headerRegionFromNavigator()
    const l = langParamFromRegion(r)
    const hash = window.location.hash.replace(/^#/, '')
    navigate({ pathname: `/${l}/`, hash }, { replace: true })
  }, [navigate])
  return null
}

function LangShell({ lang }: { lang: AppLocale }) {
  const navigate = useNavigate()
  const region = regionFromLangParam(lang)
  if (region === null) {
    return <Navigate to="/es/" replace />
  }

  const onHeaderRegionChange = (r: HeaderRegion) => {
    const l = langParamFromRegion(r)
    const hash = window.location.hash.replace(/^#/, '')
    navigate({ pathname: `/${l}/`, hash })
  }

  return (
    <LocaleProvider headerRegion={region} onHeaderRegionChange={onHeaderRegionChange}>
      <SitePathsProvider basePath={`/${lang}`}>
        <App />
      </SitePathsProvider>
    </LocaleProvider>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/es/*" element={<LangShell lang="es" />} />
        <Route path="/pt/*" element={<LangShell lang="pt" />} />
        <Route path="/en/*" element={<LangShell lang="en" />} />
        <Route path="*" element={<Navigate to="/es/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
