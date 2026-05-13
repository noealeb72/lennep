import './App.css'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { ServicesSection } from './sections/ServicesSection'
import { ModalitiesSection } from './sections/ModalitiesSection'
import { TeamSection } from './sections/TeamSection'
import { ContactSection } from './sections/ContactSection'

function App() {
  return (
    <div className="site">
      <Header />

      <main className="main container main--centered">
        <section className="hero hero--centered">
          <div className="hero__left">
            <p className="hero__badge" role="status">
              <span className="hero__badge-dot" aria-hidden="true" />
              Servicio activo 24/7
            </p>
            <h1 className="hero__title">Teleradiología</h1>
            <p className="hero__description">
              Más de 35 especialistas disponibles 24/7 para cubrir guardias, urgencias y horarios
              programados.
            </p>
            <div className="hero__actions">
              <a className="hero__btn hero__btn--primary" href="#contacto">
                Solicitar información
              </a>
              <a className="hero__btn hero__btn--secondary" href="#servicios">
                Cobertura
              </a>
            </div>
            <p className="hero__services-detail">
              Disponemos de más de 35 especialistas activos 24/7 para cubrir guardias, urgencias y turnos
              programados (ambulatorios) en clínicas, hospitales y centros de diagnóstico por imágenes.
              Nuestro equipo brinda soporte en la resolución de estudios complejos, en la cobertura
              transitoria o permanente de subespecialidades ante ausencias o vacaciones médicas, y en la
              confección de informes de todos los estudios realizados en su institución. Apoyo profesional
              especializado y subespecializado en la elaboración de informes preliminares para estudios de
              alta complejidad, con el objetivo de optimizar los tiempos operativos y ampliar la cobertura
              horaria.
            </p>
          </div>

          <div className="hero__stats">
            <article className="hero-stat">
              <p className="hero-stat__value">+35</p>
              <p className="hero-stat__label">Especialidades</p>
            </article>
            <article className="hero-stat">
              <p className="hero-stat__value">+8</p>
              <p className="hero-stat__label">Modalidades</p>
            </article>
            <article className="hero-stat">
              <p className="hero-stat__value">24/7</p>
              <p className="hero-stat__label">Disponibilidad</p>
            </article>
          </div>
        </section>

        <ServicesSection />
        <ModalitiesSection />
        <TeamSection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  )
}

export default App
