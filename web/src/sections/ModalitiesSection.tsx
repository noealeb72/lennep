const modalities = [
  'Radiografías',
  'Tomografías',
  'Resonancias magnéticas',
  'Ecografía',
  'Mamografía',
  'Medicina nuclear',
  'Densitometría ósea',
  'Estudios contrastados',
]

export function ModalitiesSection() {
  return (
    <section id="modalidades" className="content-section">
      <p className="section-tag">Modalidades</p>
      <h2>Cobertura completa en diagnóstico</h2>
      <p className="section-intro">
        Nuestro equipo cubre las principales modalidades de diagnóstico por imagen.
      </p>

      <div className="section-grid section-grid--two">
        <div className="list-card">
          {modalities.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
        <article className="highlight-card">
          <p className="highlight-card__value">8+</p>
          <p className="highlight-card__title">Modalidades de diagnóstico</p>
          <ul>
            <li>Calidad diagnóstica garantizada</li>
            <li>Consistencia en los informes</li>
            <li>Continuidad del servicio</li>
          </ul>
        </article>
      </div>
    </section>
  )
}
