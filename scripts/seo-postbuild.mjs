/**
 * Tras `vite build`: escribe dist/sitemap.xml y añade Sitemap a dist/robots.txt.
 * URL base: VITE_SITE_URL (env o .env / .env.production) sin barra final, o https://www.lennepgroup.com
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { projectRoot, siteOrigin } from './resolve-site-url.mjs'

const dist = join(projectRoot, 'dist')
const publicDir = join(projectRoot, 'public')

if (!existsSync(dist)) {
  console.warn('[seo-postbuild] dist/ no existe; omite sitemap (¿ejecutaste vite build?).')
  process.exit(0)
}

const base = siteOrigin()
const lastmod = new Date().toISOString().slice(0, 10)
/** Debe coincidir con `src/routing/localePaths.ts` → LOCALE_PATH_SEGMENTS */
const localePaths = ['es', 'pt', 'en']

/** Debe coincidir con `replaceHreflangAlternates` en src/seo/documentMeta.ts */
const hreflangAlternates = [
  ['es', 'es'],
  ['pt-BR', 'pt'],
  ['en', 'en'],
  ['x-default', 'es'],
]

function hreflangLinks() {
  return hreflangAlternates
    .map(
      ([hreflang, seg]) =>
        `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${base}/${seg}/"/>`
    )
    .join('\n')
}

const urlEntries = localePaths
  .map(
    (seg) => `  <url>
    <loc>${base}/${seg}/</loc>
${hreflangLinks()}
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`
  )
  .join('\n')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>
`

writeFileSync(join(dist, 'sitemap.xml'), sitemap, 'utf8')

const robotsTemplate = readFileSync(join(publicDir, 'robots.txt'), 'utf8').trimEnd()
const robotsOut = `${robotsTemplate}\n\nSitemap: ${base}/sitemap.xml\n`
writeFileSync(join(dist, 'robots.txt'), robotsOut, 'utf8')

console.log(`[seo-postbuild] sitemap.xml + robots (Sitemap: ${base}/sitemap.xml)`)
