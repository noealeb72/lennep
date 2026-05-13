function ensureMeta(attr: 'name' | 'property', key: string): HTMLMetaElement {
  const sel = attr === 'name' ? `meta[name="${key}"]` : `meta[property="${key}"]`
  let el = document.head.querySelector(sel) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  return el
}

function ensureCanonical(href: string): void {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

const OG_LOCALES = ['es_ES', 'pt_BR', 'en_US'] as const

function replaceOgLocaleAlternates(currentOgLocale: string): void {
  document.head.querySelectorAll('meta[property="og:locale:alternate"]').forEach((n) => n.remove())
  for (const loc of OG_LOCALES) {
    if (loc === currentOgLocale) continue
    const el = document.createElement('meta')
    el.setAttribute('property', 'og:locale:alternate')
    el.setAttribute('content', loc)
    document.head.appendChild(el)
  }
}

/** hreflang + x-default (rutas /es/, /pt/, /en/). */
function replaceHreflangAlternates(origin: string): void {
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((n) => n.remove())
  const paths = ['/es/', '/pt/', '/en/'] as const
  const pairs: [string, (typeof paths)[number]][] = [
    ['es', paths[0]],
    ['pt-BR', paths[1]],
    ['en', paths[2]],
    ['x-default', paths[0]],
  ]
  for (const [hreflang, p] of pairs) {
    const el = document.createElement('link')
    el.rel = 'alternate'
    el.setAttribute('hreflang', hreflang)
    el.href = `${origin}${p}`
    document.head.appendChild(el)
  }
}

/** JSON-LD vía `src` + blob para poder usar CSP sin `script-src 'unsafe-inline'`. */
function setJsonLdScript(id: string, json: object): void {
  let el = document.getElementById(id) as HTMLScriptElement | null
  const prev = el?.dataset.blobUrl
  if (prev) {
    try {
      URL.revokeObjectURL(prev)
    } catch {
      /* noop */
    }
  }
  const blob = new Blob([JSON.stringify(json)], { type: 'application/ld+json' })
  const url = URL.createObjectURL(blob)
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.dataset.blobUrl = url
  el.textContent = ''
  el.src = url
}

export type SeoPayload = {
  title: string
  description: string
  keywords: string
  localeOg: string
  canonicalBase: string
  /** Ruta de esta versión lingüística, ej. `/es/`. */
  canonicalPath: string
}

export function applySeoToDocument(payload: SeoPayload): void {
  const { title, description, keywords, localeOg, canonicalBase, canonicalPath } = payload

  document.title = title

  ensureMeta('name', 'description').setAttribute('content', description)
  ensureMeta('name', 'keywords').setAttribute('content', keywords)
  ensureMeta('name', 'robots').setAttribute('content', 'index, follow')

  ensureMeta('property', 'og:type').setAttribute('content', 'website')
  ensureMeta('property', 'og:site_name').setAttribute('content', 'Lennep')
  ensureMeta('property', 'og:title').setAttribute('content', title)
  ensureMeta('property', 'og:description').setAttribute('content', description)
  ensureMeta('property', 'og:locale').setAttribute('content', localeOg)
  replaceOgLocaleAlternates(localeOg)

  ensureMeta('name', 'twitter:card').setAttribute('content', 'summary_large_image')
  ensureMeta('name', 'twitter:title').setAttribute('content', title)
  ensureMeta('name', 'twitter:description').setAttribute('content', description)

  const origin = canonicalBase.replace(/\/$/, '')
  const pathSeg = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`
  const pageCanonical = `${origin}${pathSeg.endsWith('/') ? pathSeg : `${pathSeg}/`}`
  ensureCanonical(pageCanonical)
  replaceHreflangAlternates(origin)

  const ogImage = `${origin}/logo.png`
  ensureMeta('property', 'og:url').setAttribute('content', pageCanonical)
  ensureMeta('property', 'og:image').setAttribute('content', ogImage)
  ensureMeta('property', 'og:image:alt').setAttribute('content', title)
  ensureMeta('name', 'twitter:image').setAttribute('content', ogImage)

  const orgHome = `${origin}/`
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${orgHome}#organization`,
    name: 'Lennep',
    description,
    url: orgHome,
    logo: {
      '@type': 'ImageObject',
      url: ogImage,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contacto@lennepgroup.com',
      telephone: '+56-9-3624-1165',
      availableLanguage: ['Spanish', 'Portuguese', 'English'],
    },
  }

  setJsonLdScript('seo-organization-jsonld', json)
}
