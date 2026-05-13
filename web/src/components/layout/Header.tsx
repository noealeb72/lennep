export function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <a className="brand" href="/">
          <img
            className="brand__logo"
            src="/logo.png"
            alt=""
            width="396"
            height="132"
            decoding="async"
          />
          <span className="brand__text">
            <span className="brand__name">lennep</span>
            <span className="brand__subtitle">servicio de telemedicina</span>
          </span>
        </a>

        <nav className="nav" aria-label="Navegación principal">
          <a href="#servicios">Servicios</a>
          <a href="#cobertura-especialistas">Cobertura</a>
          <a href="#modalidades">Modalidades</a>
          <a href="#beneficios">Por qué elegirnos</a>
          <a className="nav__cta" href="#contacto">
            Contacto
          </a>
        </nav>
      </div>
    </header>
  )
}
