import { useEffect } from 'react'
import { useLocale } from '../locale/LocaleContext'
import type { AppLocale } from '../locale/types'
import { useSitePaths } from '../routing/SitePathsContext'
import { applySeoToDocument } from '../seo/documentMeta'

const OG_LOCALE: Record<AppLocale, string> = {
  es: 'es_ES',
  pt: 'pt_BR',
  en: 'en_US',
}

export function SeoHead() {
  const { t, locale } = useLocale()
  const { basePath } = useSitePaths()

  useEffect(() => {
    const fromEnv = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '')
    const base = fromEnv || window.location.origin
    const canonicalPath = `${basePath.endsWith('/') ? basePath.slice(0, -1) : basePath}/`

    applySeoToDocument({
      title: t('seo.title'),
      description: t('seo.description'),
      keywords: t('seo.keywords'),
      localeOg: OG_LOCALE[locale],
      canonicalBase: base,
      canonicalPath,
    })
  }, [locale, t, basePath])

  return null
}
