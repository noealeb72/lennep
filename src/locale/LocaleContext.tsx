import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { messages } from './messages'
import type { AppLocale, HeaderRegion } from './types'

export function headerRegionFromNavigator(): HeaderRegion {
  if (typeof navigator === 'undefined') return 'ar'
  const rawList = [navigator.language, ...(navigator.languages ?? [])]
  const seen = new Set<string>()
  for (const raw of rawList) {
    if (!raw) continue
    const tag = raw.split(';')[0]?.trim().toLowerCase()
    if (!tag || seen.has(tag)) continue
    seen.add(tag)
    const base = tag.split('-')[0]
    if (base === 'pt') return 'br'
    if (base === 'en') return 'us'
    if (base === 'es') return 'ar'
  }
  return 'ar'
}

function regionToLocale(r: HeaderRegion): AppLocale {
  if (r === 'br') return 'pt'
  if (r === 'us') return 'en'
  return 'es'
}

type LocaleCtx = {
  locale: AppLocale
  headerRegion: HeaderRegion
  setHeaderRegion: (r: HeaderRegion) => void
  t: (key: string) => string
  ta: (key: string) => readonly string[]
}

const LocaleContext = createContext<LocaleCtx | null>(null)

type LocaleProviderProps = {
  children: ReactNode
  headerRegion: HeaderRegion
  onHeaderRegionChange: (r: HeaderRegion) => void
}

export function LocaleProvider({
  children,
  headerRegion,
  onHeaderRegionChange,
}: LocaleProviderProps) {
  const locale = useMemo(() => regionToLocale(headerRegion), [headerRegion])

  useEffect(() => {
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : locale === 'en' ? 'en' : 'es'
  }, [locale])

  const t = useCallback(
    (key: string) => {
      const v = messages[locale][key]
      return typeof v === 'string' ? v : key
    },
    [locale]
  )

  const ta = useCallback(
    (key: string) => {
      const v = messages[locale][key]
      return Array.isArray(v) ? v : []
    },
    [locale]
  )

  const value = useMemo(
    () => ({
      locale,
      headerRegion,
      setHeaderRegion: onHeaderRegionChange,
      t,
      ta,
    }),
    [locale, headerRegion, onHeaderRegionChange, t, ta]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
