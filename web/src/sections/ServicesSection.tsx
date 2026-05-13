export function ServicesSection() {
  return (
    <section id="servicios" className="content-section">
      <p className="section-tag">Nuestros servicios</p>
      <h2>Soluciones adaptadas a cada necesidad</h2>
      <p className="section-intro">
        Cobertura integral para instituciones de salud con diferentes perfiles de demanda.
      </p>

      <div className="section-grid section-grid--three">
        <article className="info-card">
          <h3>Cobertura crítica</h3>
          <p>Apoyo para guardias, urgencias y picos de demanda.</p>
        </article>
        <article className="info-card">
          <h3>Cobertura programada</h3>
          <p>Reemplazos, vacaciones y expansión de capacidad.</p>
        </article>
        <article className="info-card">
          <h3>Equipo subespecializado</h3>
          <p>Red médica amplia para múltiples modalidades.</p>
        </article>
      </div>
    </section>
  )
}
