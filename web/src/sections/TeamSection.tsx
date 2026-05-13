export function TeamSection() {
  return (
    <section id="equipo" className="content-section content-section--accent">
      <p className="section-tag section-tag--light">Por qué elegirnos</p>
      <h2>Beneficios de trabajar con Lennep</h2>
      <p className="section-intro">
        Más de 35 especialistas comprometidos con la excelencia diagnóstica.
      </p>

      <div className="section-grid section-grid--three">
        <article className="accent-card">
          <h3>Cobertura flexible</h3>
          <p>Horarios fijos y rotativos adaptados a su institución.</p>
        </article>
        <article className="accent-card">
          <h3>Respuesta rápida</h3>
          <p>Operativa ordenada según demanda y complejidad.</p>
        </article>
        <article className="accent-card">
          <h3>Calidad garantizada</h3>
          <p>Consistencia y continuidad del servicio.</p>
        </article>
      </div>
    </section>
  )
}
