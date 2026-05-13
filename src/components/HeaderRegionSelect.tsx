import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useLocale } from '../locale/LocaleContext'
import type { HeaderRegion } from '../locale/types'

const REGIONS: HeaderRegion[] = ['ar', 'br', 'us']

function RegionFlag({ region, className }: { region: HeaderRegion; className?: string }) {
  const cn = ['nav-region-flag', className].filter(Boolean).join(' ')
  switch (region) {
    case 'ar':
      return (
        <svg className={cn} viewBox="0 0 24 16" width="24" height="16" aria-hidden="true">
          <rect width="24" height="5.33" y="0" fill="#74ACDF" />
          <rect width="24" height="5.34" y="5.33" fill="#FFFFFF" />
          <rect width="24" height="5.33" y="10.67" fill="#74ACDF" />
        </svg>
      )
    case 'br':
      return (
        <svg className={cn} viewBox="0 0 24 16" width="24" height="16" aria-hidden="true">
          <rect width="24" height="16" fill="#009B3A" />
          <polygon points="12,3 19,13 5,13" fill="#FFDF00" />
          <circle cx="12" cy="10" r="3.1" fill="#002776" />
        </svg>
      )
    case 'us':
      return (
        <svg className={cn} viewBox="0 0 24 16" width="24" height="16" aria-hidden="true">
          <rect width="24" height="16" fill="#FFFFFF" />
          <path
            fill="#B22234"
            d="M0 0h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0z"
          />
          <rect width="9.6" height="8.6" fill="#3C3B6E" />
        </svg>
      )
    default:
      return null
  }
}

type Props = { variant: 'desktop' | 'mobile' }

export function HeaderRegionSelect({ variant }: Props) {
  const { headerRegion, setHeaderRegion, t } = useLocale()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  const pick = (r: HeaderRegion) => {
    setHeaderRegion(r)
    close()
  }

  const wrapClass =
    variant === 'mobile' ? 'nav__region-select nav__locale--mobile-bar' : 'nav__region-select'

  return (
    <div className={wrapClass} ref={wrapRef}>
      <button
        type="button"
        className="nav__locale nav__locale--custom-trigger"
        aria-label={t('nav.region.aria')}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
      >
        <RegionFlag region={headerRegion} />
      </button>
      {open ? (
        <ul id={listId} className="nav__locale-panel" role="listbox" aria-label={t('nav.region.aria')}>
          {REGIONS.map((r) => (
            <li key={r} className="nav__locale-panel__item" role="presentation">
              <button
                type="button"
                className={`nav__locale-option${headerRegion === r ? ' nav__locale-option--current' : ''}`}
                role="option"
                aria-selected={headerRegion === r}
                aria-label={t(`nav.region.label.${r}`)}
                onClick={() => pick(r)}
              >
                <RegionFlag region={r} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
