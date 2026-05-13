import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

function parseViteSiteUrlFromFile(path) {
  if (!existsSync(path)) return null
  const text = readFileSync(path, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const m = t.match(/^VITE_SITE_URL\s*=\s*(.*)$/)
    if (!m) continue
    let v = m[1].trim()
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1)
    }
    return v || null
  }
  return null
}

/** URL pública configurada o null. */
export function resolveSiteUrlRaw() {
  if (process.env.VITE_SITE_URL?.trim()) return process.env.VITE_SITE_URL.trim()
  const envFiles = [
    '.env.production.local',
    '.env.production',
    '.env.local',
    '.env',
  ]
  let last = null
  for (const name of envFiles) {
    const found = parseViteSiteUrlFromFile(join(projectRoot, name))
    if (found) last = found
  }
  return last
}

/** Origen HTTPS sin barra final (fallback lennepgroup.com). */
export function siteOrigin() {
  return (resolveSiteUrlRaw() ?? 'https://www.lennepgroup.com').replace(/\/$/, '')
}
