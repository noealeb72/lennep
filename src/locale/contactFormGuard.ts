const STORAGE_KEY = 'lennep-contact-sends'
const MAX_SENDS_PER_HOUR = 3
const WINDOW_MS = 60 * 60 * 1000
const MIN_GAP_MS = 60 * 1000
export const MIN_FORM_AGE_MS = 2500

type SendEntry = { at: number }

function readLog(): SendEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((e): e is SendEntry => typeof e === 'object' && e !== null && typeof e.at === 'number')
  } catch {
    return []
  }
}

function prune(log: SendEntry[]): SendEntry[] {
  const cutoff = Date.now() - WINDOW_MS
  return log.filter((e) => e.at > cutoff)
}

export type ContactGuardResult = 'ok' | 'rate_limit' | 'too_fast'

export function checkContactFormGuard(formOpenedAt: number): ContactGuardResult {
  if (Date.now() - formOpenedAt < MIN_FORM_AGE_MS) return 'too_fast'
  const log = prune(readLog())
  if (log.length >= MAX_SENDS_PER_HOUR) return 'rate_limit'
  const last = log.at(-1)
  if (last && Date.now() - last.at < MIN_GAP_MS) return 'rate_limit'
  return 'ok'
}

export function recordContactFormSend(): void {
  const log = prune(readLog())
  log.push({ at: Date.now() })
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log))
  } catch {
    /* modo privado o cuota agotada */
  }
}
