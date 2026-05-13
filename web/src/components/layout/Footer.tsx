const WHATSAPP_HREF = `https://wa.me/56936241165?text=${encodeURIComponent(
  'Hola, me gustaría recibir información sobre los servicios de Lennep (teleradiología y diagnóstico por imágenes).',
)}`

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          <div className="footer__main">
            <div className="footer__brand">
              <img
                className="footer__logo"
                src="/logo.png"
                alt=""
                width="140"
                height="55"
                decoding="async"
              />
              <div className="footer__text">
                <span className="footer__name">lennep</span>
                <span className="footer__subtitle">servicio de telemedicina</span>
              </div>
            </div>
            <p className="footer__about">
              {`Lennep ofrece teleradiología y diagnóstico por imágenes para clínicas, hospitales y centros de salud,\ncon equipo especializado y cobertura 24/7.`}
            </p>
          </div>
          <nav className="footer__nav" aria-label="Navegación principal">
            <a className="footer__nav-link" href="#servicios">
              Servicios
            </a>
            <a className="footer__nav-link" href="#cobertura-especialistas">
              Cobertura
            </a>
            <a className="footer__nav-link" href="#modalidades">
              Modalidades
            </a>
            <a className="footer__nav-link" href="#beneficios">
              Por qué elegirnos
            </a>
            <a className="footer__nav-link" href="#contacto">
              Contacto
            </a>
          </nav>
          <div className="footer__contact">
            <p className="footer__contact-title">Contacto</p>
            <div className="footer__contact-body">
              <a
                className="footer__contact-link"
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="footer__contact-label">WhatsApp</span>
                <span className="footer__contact-value">+56 9 3624 1165</span>
              </a>
              <a className="footer__contact-link" href="mailto:contacto@lennepgroup.com">
                <span className="footer__contact-label">Email</span>
                <span className="footer__contact-value">contacto@lennepgroup.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container">
          <p className="footer__copy">
            © 2026 Lennep. Todos los derechos reservados. - NAB Servicios Digitales
          </p>
        </div>
      </div>
    </footer>
  )
}
