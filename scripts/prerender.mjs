/**
 * Tras `vite build`: genera dist/es|pt|en/index.html con el HTML ya renderizado (Playwright).
 * Requiere: npx playwright install chromium
 * Omitir build: SKIP_PRERENDER=1 npm run build
 */
import http from 'node:http'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import handler from 'serve-handler'
import { chromium } from 'playwright'
import { projectRoot as root, siteOrigin } from './resolve-site-url.mjs'

const dist = join(root, 'dist')

if (process.env.SKIP_PRERENDER === '1') {
  console.log('[prerender] SKIP_PRERENDER=1 — omitido.')
  process.exit(0)
}

if (!existsSync(join(dist, 'index.html'))) {
  console.error('[prerender] Falta dist/index.html. Ejecuta vite build antes.')
  process.exit(1)
}

const LOCALES = ['es', 'pt', 'en']
const PORT = Number(process.env.PRERENDER_PORT || 47941)

/** SPA: solo rutas de idioma → index.html; /assets/* sigue siendo estático. */
const spaRewrites = [
  { source: '/es', destination: '/index.html' },
  { source: '/es/**', destination: '/index.html' },
  { source: '/pt', destination: '/index.html' },
  { source: '/pt/**', destination: '/index.html' },
  { source: '/en', destination: '/index.html' },
  { source: '/en/**', destination: '/index.html' },
]

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      handler(req, res, {
        public: 'dist',
        rewrites: spaRewrites,
      }).catch(() => {
        if (!res.headersSent) {
          res.statusCode = 500
          res.end()
        }
      })
    })
    server.listen(PORT, '127.0.0.1', () => resolve(server))
    server.on('error', reject)
  })
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  const prevCwd = process.cwd()
  process.chdir(root)

  const server = await startStaticServer()

  let browser
  try {
    browser = await chromium.launch({ headless: true })
  } catch (e) {
    await new Promise((res) => server.close(() => res()))
    process.chdir(prevCwd)
    console.error('[prerender] No se pudo abrir Chromium. Ejecuta: npx playwright install chromium')
    console.error(e)
    process.exit(1)
  }

  const base = `http://127.0.0.1:${PORT}`

  try {
    for (const loc of LOCALES) {
      const page = await browser.newPage()
      const url = `${base}/${loc}/`
      await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 })
      await page.waitForFunction(
        (expected) => {
          const link = document.querySelector('link[rel="canonical"]')
          return Boolean(link?.getAttribute('href')?.includes(`/${expected}/`))
        },
        loc,
        { timeout: 25000 }
      )
      await sleep(200)

      const jsonLdText = await page.evaluate(async () => {
        const el = document.getElementById('seo-organization-jsonld')
        if (!el?.src?.startsWith('blob:')) return ''
        try {
          return await (await fetch(el.src)).text()
        } catch {
          return ''
        }
      })

      const prodOrigin = siteOrigin()
      const localOrigin = `http://127.0.0.1:${PORT}`
      let html = await page.content()
      html = html.split(localOrigin).join(prodOrigin)
      if (jsonLdText) {
        html = html.replace(
          /<script id="seo-organization-jsonld"[\s\S]*?<\/script>/,
          `<script type="application/ld+json" id="seo-organization-jsonld">${jsonLdText}</script>`
        )
      }

      const outDir = join(dist, loc)
      mkdirSync(outDir, { recursive: true })
      writeFileSync(join(outDir, 'index.html'), html, 'utf8')
      await page.close()
      console.log(`[prerender] /${loc}/ → dist/${loc}/index.html`)
    }
  } finally {
    await browser.close()
    await new Promise((res) => server.close(() => res()))
    if (process.cwd() === root) process.chdir(prevCwd)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
