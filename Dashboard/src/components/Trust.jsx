import { SITE_CONTENT } from "../content/siteContent";

function Trust() {
  return (
    <section id="trust" className="section trust-section">
      <div className="container">
        <p className="eyebrow">Trust and Safety</p>
        <h2>Built for responsible, user-controlled automation</h2>
        <div className="trust-grid">
          {SITE_CONTENT.trustPoints.map((point) => (
            <article key={point} className="card trust-card">
              <h3>{point}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Trust;
