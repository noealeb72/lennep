import { useCallback, useEffect, useId, useState } from 'react'
import { useLocale } from '../locale/LocaleContext'

const STORAGE_KEY = 'lennep-color-scheme'
export type SiteColorScheme = 'lennep' | 'verde-celeste'

function readStoredScheme(): SiteColorScheme {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'verde-celeste') return 'verde-celeste'
  } catch {
    /* ignore */
  }
  return 'lennep'
}

function applySchemeToDom(scheme: SiteColorScheme): void {
  const root = document.documentElement
  if (scheme === 'lennep') root.removeAttribute('data-color-scheme')
  else root.setAttribute('data-color-scheme', scheme)

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    const c = getComputedStyle(root).getPropertyValue('--meta-theme-color').trim()
    if (c) meta.setAttribute('content', c)
  }
}

export function ColorSchemeToggle({
  className = '',
  variant = 'icon',
}: {
  className?: string
  variant?: 'icon' | 'labeled'
}) {
  const { t } = useLocale()
  const labelId = useId()
  const [scheme, setScheme] = useState<SiteColorScheme>(() => readStoredScheme())

  useEffect(() => {
    applySchemeToDom(scheme)
    try {
      localStorage.setItem(STORAGE_KEY, scheme)
    } catch {
      /* ignore */
    }
  }, [scheme])

  const isAlt = scheme === 'verde-celeste'
  const toggle = useCallback(() => {
    setScheme(isAlt ? 'lennep' : 'verde-celeste')
  }, [isAlt])

  if (variant === 'labeled') {
    return (
      <div className={`nav-mobile-drawer__theme-row ${className}`.trim()}>
        <span className="nav-mobile-drawer__theme-label" id={labelId}>
          {t('nav.theme.label')}
        </span>
        <button
          type="button"
          className="color-scheme-toggle"
          role="switch"
          aria-checked={isAlt}
          aria-labelledby={labelId}
          onClick={toggle}
        >
          <span className="color-scheme-toggle__track" aria-hidden="true" />
          <span className="color-scheme-toggle__thumb" aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      className={`color-scheme-toggle ${className}`.trim()}
      role="switch"
      aria-checked={isAlt}
      aria-label={t('nav.theme.aria')}
      title={t('nav.theme.title')}
      onClick={toggle}
    >
      <span className="color-scheme-toggle__track" aria-hidden="true" />
      <span className="color-scheme-toggle__thumb" aria-hidden="true" />
    </button>
  )
}

export function initColorSchemeFromStorage(): void {
  applySchemeToDom(readStoredScheme())
}
