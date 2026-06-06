import { SITE_CONTENT } from "../content/siteContent";

function Features() {
  return (
    <section id="features" className="section">
      <div className="container">
        <p className="eyebrow">Features</p>
        <h2>Everything you need to keep replies fast and professional</h2>
        <div className="feature-grid">
          {SITE_CONTENT.features.map((feature) => (
            <article className="card" key={feature.title}>
              <span className="feature-icon" aria-hidden="true">
                {feature.icon}
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
