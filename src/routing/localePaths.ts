import type { AppLocale, HeaderRegion } from '../locale/types'

/** Segmentos de URL (debe coincidir con `scripts/seo-postbuild.mjs`). */
export const LOCALE_PATH_SEGMENTS: readonly AppLocale[] = ['es', 'pt', 'en']

export function regionFromLangParam(lang: string | undefined): HeaderRegion | null {
  if (lang === 'es') return 'ar'
  if (lang === 'pt') return 'br'
  if (lang === 'en') return 'us'
  return null
}

export function langParamFromRegion(r: HeaderRegion): AppLocale {
  if (r === 'br') return 'pt'
  if (r === 'us') return 'en'
  return 'es'
}
