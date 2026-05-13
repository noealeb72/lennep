import './App.css'
import { useCallback, useEffect, useState } from 'react'
import type { FocusEvent, FormEvent } from 'react'
import { ColorSchemeToggle } from './components/ColorSchemeToggle'
import { HeaderRegionSelect } from './components/HeaderRegionSelect'
import { WhatsAppMark } from './components/WhatsAppMark'
import { SeoHead } from './components/SeoHead'
import { useLocale } from './locale/LocaleContext'
import { buildMailtoContactUrl, submitContactToInbox } from './locale/contactFormSubmit'
import { whatsappConversationUrl } from './locale/whatsappUrl'
import { useSitePaths } from './routing/SitePathsContext'

const BENEFIT_ROWS = [
  { icon: 'clock' as const },
  { icon: 'user' as const },
  { icon: 'building' as const },
  { icon: 'bolt' as const },
  { icon: 'puzzle' as const },
  { icon: 'shield' as const },
] as const

/** Logo para paleta «verde y celeste» (`data-color-scheme="verde-celeste"`). Archivo en `public/`. */
const BRAND_LOGO_DEFAULT = '/logo.png'
const BRAND_LOGO_CELESTE = '/logo_celeste.png'

function BenefitIcon({ name }: { name: (typeof BENEFIT_ROWS)[number]['icon'] }) {
  const props = {
    className: 'benefit-card__icon-svg',
    viewBox: '0 0 24 24',
    width: 22,
    height: 22,
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (name) {
    case 'clock':
      return (
        <svg {...props} aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      )
    case 'user':
      return (
        <svg {...props} aria-hidden="true">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1" />
        </svg>
      )
    case 'building':
      return (
        <svg {...props} aria-hidden="true">
          <path d="M3 21h18" />
          <path d="M6 21V8h5v13" />
          <path d="M13 21V4h5v17" />
          <path d="M8.5 12h1" />
          <path d="M8.5 16h1" />
          <path d="M15.5 9h1" />
          <path d="M15.5 13h1" />
          <path d="M15.5 17h1" />
        </svg>
      )
    case 'bolt':
      return (
        <svg {...props} aria-hidden="true">
          <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z" />
        </svg>
      )
    case 'puzzle':
      return (
        <svg {...props} aria-hidden="true" strokeWidth={1.75}>
          <rect x="4" y="4" width="6.5" height="6.5" rx="1.25" />
          <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.25" />
          <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.25" />
          <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.25" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...props} aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
    default:
      return null
  }
}

function App() {
  const { t, ta } = useLocale()
  const { basePath } = useSitePaths()
  const whatsappHref = whatsappConversationUrl(t('contact.wa.preset'))
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [heroSlide, setHeroSlide] = useState(0)
  const [heroSliderHoverPause, setHeroSliderHoverPause] = useState(false)
  const [docHidden, setDocHidden] = useState(false)
  const [contactFormStatus, setContactFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [contactFormMailtoHref, setContactFormMailtoHref] = useState<string | null>(null)

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const normalizeContactEmail = useCallback((e: FocusEvent<HTMLInputElement>) => {
    const el = e.currentTarget
    el.value = el.value.trim().toLowerCase()
  }, [])

  const normalizeContactPhone = useCallback((e: FocusEvent<HTMLInputElement>) => {
    const el = e.currentTarget
    el.value = el.value.replace(/\D/g, '')
  }, [])

  const normalizeContactName = useCallback((e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.trim().replace(/\s+/g, ' ')
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  useEffect(() => {
    const onVis = () => setDocHidden(document.visibilityState === 'hidden')
    document.addEventListener('visibilitychange', onVis)
    onVis()
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (menuOpen || docHidden || heroSliderHoverPause) return
    const id = window.setInterval(() => {
      setHeroSlide((s) => (s + 1) % 2)
    }, 7500)
    return () => window.clearInterval(id)
  }, [menuOpen, docHidden, heroSliderHoverPause])

  async function handleContactSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const payload = {
      nombre: String(fd.get('nombre') ?? '')
        .trim()
        .replace(/\s+/g, ' '),
      institucion: String(fd.get('institucion') ?? '').trim(),
      email: String(fd.get('email') ?? '')
        .trim()
        .toLowerCase(),
      telefono: String(fd.get('telefono') ?? '').replace(/\D/g, ''),
      mensaje: String(fd.get('mensaje') ?? '').trim(),
    }
    if (
      payload.nombre.length < 2 ||
      !payload.email ||
      !payload.telefono ||
      !payload.mensaje
    ) {
      return
    }
    setContactFormMailtoHref(null)
    setContactFormStatus('sending')
    const subject = t('contact.form.subject')
    const ok = await submitContactToInbox(payload, subject)
    if (ok) {
      setContactFormStatus('success')
      form.reset()
    } else {
      setContactFormStatus('error')
      setContactFormMailtoHref(buildMailtoContactUrl(payload, subject))
    }
  }

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((el) => el.classList.add('is-visible'))
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            obs.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -5% 0px', threshold: 0.07 }
    )
    nodes.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <div className="site">
      <SeoHead />
      <header className={`header${headerScrolled ? ' header--scrolled' : ''}${menuOpen ? ' header--menu-open' : ''}`}>
        <div className="header__inner">
          <a className="brand" href={`${basePath}/`}>
            <span className="brand__logo-stack">
              <img
                className="brand__logo brand__logo--lennep"
                src={BRAND_LOGO_DEFAULT}
                alt={t('brand.logoAlt')}
                width="312"
                height="104"
                decoding="async"
              />
              <img
                className="brand__logo brand__logo--celeste"
                src={BRAND_LOGO_CELESTE}
                alt={t('brand.logoAlt')}
                width="312"
                height="104"
                decoding="async"
              />
            </span>
            <span className="brand__text">
              <span className="brand__name">lennep</span>
              <span className="brand__subtitle">{t('brand.subtitle')}</span>
            </span>
          </a>

          <nav className="nav nav--desktop" aria-label={t('nav.aria')}>
            <a className="nav__link" href="#servicios">
              {t('nav.servicios')}
            </a>
            <a className="nav__link" href="#cobertura-especialistas">
              {t('nav.cobertura')}
            </a>
            <a className="nav__link" href="#modalidades">
              {t('nav.modalidades')}
            </a>
            <a className="nav__link" href="#beneficios">
              {t('nav.beneficios')}
            </a>
            <div className="nav__end">
              <a className="nav__cta" href="#contacto">
                {t('nav.contactar')}
              </a>
              <HeaderRegionSelect variant="desktop" />
            </div>
          </nav>

          <ColorSchemeToggle className="color-scheme-toggle--mobile-bar" />
          <HeaderRegionSelect variant="mobile" />

          <button
            type="button"
            className="nav__menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="nav-mobile-drawer"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">{menuOpen ? t('nav.menuClose') : t('nav.menu')}</span>
            <span className="nav__menu-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>

        <div
          className={`nav-mobile-backdrop${menuOpen ? ' is-visible' : ''}`}
          aria-hidden="true"
          onClick={closeMenu}
        />

        <aside
          id="nav-mobile-drawer"
          className={`nav-mobile-drawer${menuOpen ? ' is-open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label={t('nav.aria')}
          aria-hidden={!menuOpen}
          inert={!menuOpen ? true : undefined}
        >
          <div className="nav-mobile-drawer__top">
            <button type="button" className="nav-mobile-drawer__close" onClick={closeMenu} aria-label={t('nav.menuClose')}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="nav-mobile-drawer__nav" aria-label={t('nav.aria')}>
            <a className="nav-mobile-drawer__link" href="#servicios" onClick={closeMenu}>
              {t('nav.servicios')}
            </a>
            <a className="nav-mobile-drawer__link" href="#cobertura-especialistas" onClick={closeMenu}>
              {t('nav.cobertura')}
            </a>
            <a className="nav-mobile-drawer__link" href="#modalidades" onClick={closeMenu}>
              {t('nav.modalidades')}
            </a>
            <a className="nav-mobile-drawer__link" href="#beneficios" onClick={closeMenu}>
              {t('nav.beneficios')}
            </a>
            <a className="nav-mobile-drawer__link nav-mobile-drawer__link--contact" href="#contacto" onClick={closeMenu}>
              {t('nav.contactar')}
            </a>
          </nav>
          <div className="nav-mobile-drawer__theme">
            <ColorSchemeToggle variant="labeled" />
          </div>
        </aside>
      </header>

      <main className="main">
        <div className="hero-stack">
          <div
            className="hero-slider"
            role="region"
            aria-label={t('hero.slider.aria')}
            onMouseEnter={() => setHeroSliderHoverPause(true)}
            onMouseLeave={() => setHeroSliderHoverPause(false)}
          >
            <div className="hero-slider__viewport">
              <div
                className={`hero-slider__pane${heroSlide === 0 ? ' hero-slider__pane--active' : ''}`}
                aria-hidden={heroSlide !== 0}
                inert={heroSlide !== 0}
              >
                <section
                  className="hero hero--split"
                  aria-labelledby="hero-title"
                >
                  <div className="hero__backdrop">
                    <img
                      className="hero__photo hero__photo--hero-main"
                      src="/hero-consulta.png"
                      alt={t('hero.imgAlt')}
                      decoding="async"
                      fetchPriority="high"
                    />
                    <div className="hero__overlay" aria-hidden="true" />
                  </div>
                  <div className="container hero__split-inner">
                    <div className="hero__left">
                      <p className="hero__badge" role="status">
                        <span className="hero__badge-dot" aria-hidden="true" />
                        {t('hero.badge')}
                      </p>
                      <h1 id="hero-title" className="hero__title hero__title--brand">
                        {t('hero.title')}
                      </h1>
                      <p className="hero__description hero__description--muted">{t('hero.description')}</p>
                      <div className="hero__actions">
                        <a className="hero__btn hero__btn--solid" href="#contacto">
                          {t('hero.cta.info')}
                          <span className="hero__btn-arrow" aria-hidden="true">
                            →
                          </span>
                        </a>
                        <a className="hero__btn hero__btn--outline" href="#cobertura-especialistas">
                          {t('hero.cta.services')}
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div
                className={`hero-slider__pane${heroSlide === 1 ? ' hero-slider__pane--active' : ''}`}
                aria-hidden={heroSlide !== 1}
                inert={heroSlide !== 1}
              >
                <section
                  className="hero hero--split"
                  aria-labelledby="hero-teleconsulta-heading"
                >
                  <div className="hero__backdrop">
                    <img
                      className="hero__photo hero__photo--teleconsulta"
                      src="/hero-consulta-2.png"
                      alt={t('hero.teleconsulta.imgAlt')}
                      decoding="async"
                      fetchPriority="low"
                    />
                    <div className="hero__overlay hero__overlay--teleconsulta" aria-hidden="true" />
                  </div>
                  <div className="container hero__split-inner">
                    <div className="hero__left">
                      <p className="hero__badge" role="status">
                        <span className="hero__badge-dot" aria-hidden="true" />
                        {t('hero.badge')}
                      </p>
                      <h2 id="hero-teleconsulta-heading" className="hero__title hero__title--brand">
                        {t('hero.teleconsulta.title')}
                      </h2>
                      <p className="hero__description hero__description--muted">
                        {t('hero.teleconsulta.description')}
                      </p>
                      <div className="hero__actions">
                        <a className="hero__btn hero__btn--solid" href="#contacto">
                          {t('hero.teleconsulta.cta.request')}
                          <span className="hero__btn-arrow" aria-hidden="true">
                            →
                          </span>
                        </a>
                        <a className="hero__btn hero__btn--outline" href="#servicios">
                          {t('hero.teleconsulta.cta.moreInfo')}
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="hero-slider__chrome">
              <button
                type="button"
                className="hero-slider__arrow"
                aria-label={t('hero.slider.prev')}
                onClick={() => setHeroSlide((s) => (s - 1 + 2) % 2)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="hero-slider__dots" role="group" aria-label={t('hero.slider.aria')}>
                <button
                  type="button"
                  className={`hero-slider__dot${heroSlide === 0 ? ' hero-slider__dot--active' : ''}`}
                  aria-label={t('hero.slider.dotTeleradio')}
                  aria-current={heroSlide === 0 ? 'true' : undefined}
                  onClick={() => setHeroSlide(0)}
                />
                <button
                  type="button"
                  className={`hero-slider__dot${heroSlide === 1 ? ' hero-slider__dot--active' : ''}`}
                  aria-label={t('hero.slider.dotTeleconsulta')}
                  aria-current={heroSlide === 1 ? 'true' : undefined}
                  onClick={() => setHeroSlide(1)}
                />
              </div>
              <button
                type="button"
                className="hero-slider__arrow"
                aria-label={t('hero.slider.next')}
                onClick={() => setHeroSlide((s) => (s + 1) % 2)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="container hero-cards-overlap">
            <div className="hero-stats-grid" role="list">
              <article className="stat-tile stat-tile--especialistas" role="listitem">
                <div className="stat-tile__icon stat-tile__icon--teal" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 2v2" />
                    <path d="M5 2v2" />
                    <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1" />
                    <path d="M8 15a6 6 0 0 0 12 0" />
                    <path d="M2 12a4 4 0 0 0 4 4" />
                    <path d="M14 12h1a4 4 0 0 0 4-4" />
                  </svg>
                </div>
                <p className="stat-tile__value">+35</p>
                <p className="stat-tile__label">{t('stat.especialistas')}</p>
              </article>

              <article className="stat-tile stat-tile--disponibilidad" role="listitem">
                <div className="stat-tile__icon stat-tile__icon--orange stat-tile__icon--round" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="stat-tile__value">24/7</p>
                <p className="stat-tile__label">{t('stat.disponibilidad')}</p>
              </article>

              <article className="stat-tile stat-tile--modalidades" role="listitem">
                <div className="stat-tile__icon stat-tile__icon--modalidades" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="stat-tile__value">8+</p>
                <p className="stat-tile__label">{t('stat.modalidades')}</p>
              </article>
            </div>
          </div>
        </div>

        <section className="services-section" id="servicios" aria-labelledby="services-heading" data-reveal>
          <div className="container services-section__inner">
            <header className="services-section__header">
              <p className="services-section__badge">{t('services.badge')}</p>
              <h2 id="services-heading" className="services-section__title">
                {t('services.title')}
              </h2>
              <p className="services-section__subtitle">{t('services.subtitle')}</p>
            </header>

            <ul className="services-section__grid">
              <li>
                <article className="service-card">
                  <div className="service-card__icon-wrap" aria-hidden="true">
                    <svg className="service-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                  </div>
                  <h3 className="service-card__title">{t('services.card1.title')}</h3>
                  <p className="service-card__text">{t('services.card1.text')}</p>
                </article>
              </li>
              <li>
                <article className="service-card">
                  <div className="service-card__icon-wrap" aria-hidden="true">
                    <svg className="service-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="service-card__title">{t('services.card2.title')}</h3>
                  <p className="service-card__text">{t('services.card2.text')}</p>
                </article>
              </li>
              <li>
                <article className="service-card">
                  <div className="service-card__icon-wrap" aria-hidden="true">
                    <svg className="service-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <h3 className="service-card__title">{t('services.card3.title')}</h3>
                  <p className="service-card__text">{t('services.card3.text')}</p>
                </article>
              </li>
            </ul>
          </div>
        </section>

        <section
          className="services-detail-section"
          id="cobertura-especialistas"
          aria-labelledby="services-detail-heading"
          data-reveal
        >
          <div className="container services-detail-section__inner">
            <div className="services-detail-section__layout">
              <div className="services-detail-section__visual">
                <div className="services-detail-hex-cluster">
                  <figure className="services-detail-hex services-detail-hex--1">
                    <div className="services-detail-hex__inner">
                      <img
                        className="services-detail-hex__img"
                        src="/services-hex-1.jpg"
                        alt={t('servicesDetail.hex1Alt')}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </figure>
                  <figure className="services-detail-hex services-detail-hex--2">
                    <div className="services-detail-hex__inner">
                      <img
                        className="services-detail-hex__img"
                        src="/services-hex-2.jpg"
                        alt={t('servicesDetail.hex2Alt')}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </figure>
                  <figure className="services-detail-hex services-detail-hex--3">
                    <div className="services-detail-hex__inner">
                      <img
                        className="services-detail-hex__img"
                        src="/services-hex-3.jpg"
                        alt={t('servicesDetail.hex3Alt')}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </figure>
                </div>
              </div>
              <div className="services-detail-section__content">
                <p className="services-detail-section__badge">{t('servicesDetail.badge')}</p>
                <h2 id="services-detail-heading" className="services-detail-section__title">
                  <span className="services-detail-section__title-text">{t('servicesDetail.titleBefore')}</span>{' '}
                  <span className="services-detail-section__title-accent">{t('servicesDetail.titleAccent')}</span>{' '}
                  <span className="services-detail-section__title-text">{t('servicesDetail.titleAfter')}</span>
                </h2>
                <p className="services-detail-section__intro">{t('servicesDetail.introList')}</p>
                <ul className="services-detail-section__list">
                  {ta('servicesDetail.bullets').map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <a className="hero__btn hero__btn--solid services-detail-section__cta" href="#contacto">
                  {t('hero.cta.info')}
                  <span className="hero__btn-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="modalidades-section" id="modalidades" aria-labelledby="modalidades-heading" data-reveal>
          <div className="container modalidades-section__inner">
            <header className="modalidades-section__header">
              <p className="modalidades-section__badge">{t('modalidades.badge')}</p>
              <h2 id="modalidades-heading" className="modalidades-section__title">
                {t('modalidades.title')}
              </h2>
              <p className="modalidades-section__lead">{t('modalidades.lead')}</p>
            </header>
            <ul className="modalidades-section__grid">
              {ta('modalidades.items').map((nombre, i) => (
                <li key={`modalidad-${i}`}>
                  <div className="modalidad-item">
                    <span className="modalidad-item__dot" aria-hidden="true" />
                    <span className="modalidad-item__label">{nombre}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="benefits-section" id="beneficios" aria-labelledby="benefits-heading" data-reveal>
          <div className="container benefits-section__inner">
            <header className="benefits-section__header">
              <p className="benefits-section__badge">{t('benefits.badge')}</p>
              <h2 id="benefits-heading" className="benefits-section__title">
                {t('benefits.title')}
              </h2>
              <p className="benefits-section__subtitle">{t('benefits.subtitle')}</p>
            </header>
            <ul className="benefits-section__grid">
              {BENEFIT_ROWS.map((item, i) => (
                <li key={item.icon}>
                  <article className="benefit-card">
                    <div className="benefit-card__icon" aria-hidden="true">
                      <BenefitIcon name={item.icon} />
                    </div>
                    <div className="benefit-card__body">
                      <h3 className="benefit-card__title">{t(`benefit.${i}.title`)}</h3>
                      <p className="benefit-card__text">{t(`benefit.${i}.desc`)}</p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="contact-section" id="contacto" aria-labelledby="contact-heading" data-reveal>
          <div className="container contact-section__inner">
            <div className="contact-section__layout">
              <div className="contact-section__info">
                <h2 id="contact-heading" className="contact-section__badge">
                  {t('contact.title')}
                </h2>
                <ul className="contact-section__channels">
                  <li>
                    <a className="contact-channel" href="mailto:contacto@lennepgroup.com">
                      <span className="contact-channel__icon contact-channel__icon--mail" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <path d="m22 6-10 7L2 6" />
                        </svg>
                      </span>
                      <span className="contact-channel__body">
                        <span className="contact-channel__label">{t('contact.email')}</span>
                        <span className="contact-channel__value">contacto@lennepgroup.com</span>
                      </span>
                    </a>
                  </li>
                  <li>
                    <a
                      className="contact-channel"
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="contact-channel__icon contact-channel__icon--wa-cl" aria-hidden="true">
                        <WhatsAppMark className="contact-channel__wa-img" />
                      </span>
                      <span className="contact-channel__body">
                        <span className="contact-channel__label">{t('contact.wa.cl')}</span>
                        <span className="contact-channel__value">+56 9 3624 1165</span>
                      </span>
                    </a>
                  </li>
                </ul>
                <div className="contact-section__pitch">
                  <p className="contact-section__pitch-title">{t('contact.pitch.title')}</p>
                  <p className="contact-section__pitch-lead">{t('contact.pitch.lead')}</p>
                </div>
              </div>

              <div className="contact-section__form-wrap">
                <form className="contact-form" onSubmit={handleContactSubmit}>
                  <h3 className="contact-form__title">{t('contact.form.title')}</h3>
                  <div className="contact-form__fields">
                    <label className="contact-form__field">
                      <span className="contact-form__label contact-form__label--required">{t('contact.form.name')}</span>
                      <input
                        className="contact-form__input"
                        type="text"
                        name="nombre"
                        placeholder={t('contact.form.name.ph')}
                        autoComplete="name"
                        minLength={2}
                        maxLength={120}
                        pattern=".*\S.*"
                        title={t('contact.form.name.pattern')}
                        required
                        onBlur={normalizeContactName}
                      />
                    </label>
                    <label className="contact-form__field">
                      <span className="contact-form__label">
                        {t('contact.form.org')}
                        <span className="contact-form__optional"> {t('contact.form.optional')}</span>
                      </span>
                      <input
                        className="contact-form__input"
                        type="text"
                        name="institucion"
                        placeholder={t('contact.form.org.ph')}
                        autoComplete="organization"
                      />
                    </label>
                    <label className="contact-form__field">
                      <span className="contact-form__label contact-form__label--required">{t('contact.form.email')}</span>
                      <input
                        className="contact-form__input"
                        type="email"
                        name="email"
                        placeholder={t('contact.form.email.ph')}
                        autoComplete="email"
                        inputMode="email"
                        maxLength={254}
                        pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}"
                        title={t('contact.form.email.pattern')}
                        required
                        onBlur={normalizeContactEmail}
                      />
                    </label>
                    <label className="contact-form__field">
                      <span className="contact-form__label contact-form__label--required">{t('contact.form.phone')}</span>
                      <input
                        className="contact-form__input"
                        type="tel"
                        name="telefono"
                        placeholder={t('contact.form.phone.ph')}
                        autoComplete="tel"
                        inputMode="numeric"
                        minLength={8}
                        maxLength={15}
                        pattern="[0-9]{8,15}"
                        title={t('contact.form.phone.pattern')}
                        required
                        onBlur={normalizeContactPhone}
                      />
                    </label>
                    <label className="contact-form__field contact-form__field--full">
                      <span className="contact-form__label contact-form__label--required">{t('contact.form.message')}</span>
                      <textarea
                        className="contact-form__textarea"
                        name="mensaje"
                        rows={4}
                        placeholder={t('contact.form.message.ph')}
                        required
                      />
                    </label>
                  </div>
                  {contactFormStatus !== 'idle' && (
                    <p
                      className={`contact-form__feedback${
                        contactFormStatus === 'success'
                          ? ' contact-form__feedback--success'
                          : contactFormStatus === 'error'
                            ? ' contact-form__feedback--error'
                            : ' contact-form__feedback--sending'
                      }`}
                      role="status"
                      aria-live="polite"
                    >
                      {contactFormStatus === 'sending' && t('contact.form.sending')}
                      {contactFormStatus === 'success' && t('contact.form.success')}
                      {contactFormStatus === 'error' && (
                        <>
                          {t('contact.form.error')}
                          {contactFormMailtoHref ? (
                            <a className="contact-form__mailto" href={contactFormMailtoHref}>
                              {t('contact.form.mailtoLink')}
                            </a>
                          ) : null}
                        </>
                      )}
                    </p>
                  )}
                  <button
                    className="contact-form__submit"
                    type="submit"
                    disabled={contactFormStatus === 'sending'}
                  >
                    {contactFormStatus === 'sending' ? t('contact.form.sending') : t('contact.form.submit')}
                    {contactFormStatus !== 'sending' ? (
                      <span className="contact-form__submit-arrow" aria-hidden="true">
                        →
                      </span>
                    ) : null}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__grid">
            <div className="footer__main">
              <div className="footer__brand">
                <span className="footer__logo-stack">
                  <img
                    className="footer__logo footer__logo--lennep"
                    src={BRAND_LOGO_DEFAULT}
                    alt={t('brand.logoAlt')}
                    width="176"
                    height="69"
                    decoding="async"
                  />
                  <img
                    className="footer__logo footer__logo--celeste"
                    src={BRAND_LOGO_CELESTE}
                    alt={t('brand.logoAlt')}
                    width="176"
                    height="69"
                    decoding="async"
                  />
                </span>
                <div className="footer__text">
                  <span className="footer__name">lennep</span>
                  <span className="footer__subtitle">{t('brand.subtitle')}</span>
                </div>
              </div>
              <p className="footer__about">{t('footer.about')}</p>
            </div>
            <nav className="footer__nav" aria-label={t('nav.aria')}>
              <a className="footer__nav-link" href="#servicios">
                {t('nav.servicios')}
              </a>
              <a className="footer__nav-link" href="#cobertura-especialistas">
                {t('nav.cobertura')}
              </a>
              <a className="footer__nav-link" href="#modalidades">
                {t('nav.modalidades')}
              </a>
              <a className="footer__nav-link" href="#beneficios">
                {t('nav.beneficios')}
              </a>
              <a className="footer__nav-link" href="#contacto">
                {t('nav.contactar')}
              </a>
            </nav>
            <div className="footer__contact">
              <p className="footer__contact-title">{t('contact.title')}</p>
              <div className="footer__contact-body">
                <a
                  className="footer__contact-link"
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="footer__contact-label">{t('contact.wa.cl')}</span>
                  <span className="footer__contact-value">+56 9 3624 1165</span>
                </a>
                <a className="footer__contact-link" href="mailto:contacto@lennepgroup.com">
                  <span className="footer__contact-label">{t('contact.email')}</span>
                  <span className="footer__contact-value">contacto@lennepgroup.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <div className="container">
            <p className="footer__copy">{t('footer.copy')}</p>
          </div>
        </div>
      </footer>

      <a
        className="wa-float"
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('wa.aria')}
      >
        <WhatsAppMark className="wa-float__img" />
      </a>
    </div>
  )
}

export default App
