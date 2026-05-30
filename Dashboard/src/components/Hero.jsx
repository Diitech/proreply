import { SITE_CONTENT } from "../content/siteContent";

function Hero() {
  return (
    <section id="top" className="hero section">
      <div className="container hero-grid">
        <div>
          <p className="eyebrow">Built for fast-moving teams</p>
          <h1>{SITE_CONTENT.headline}</h1>
          <p className="hero-subtitle">{SITE_CONTENT.subheadline}</p>
          <div className="hero-actions">
            <a className="button" href={SITE_CONTENT.ctas.install.href}>
              {SITE_CONTENT.ctas.install.label}
            </a>
            <a className="button button-ghost" href={SITE_CONTENT.ctas.viewFeatures.href}>
              {SITE_CONTENT.ctas.viewFeatures.label}
            </a>
          </div>
        </div>
        <div className="hero-visual" aria-label="Product preview area">
          <div className="visual-card">
            <p className="visual-title">WhatsApp Web Automation</p>
            <div className="message-row">
              <span>Incoming: Hi, where is my order?</span>
            </div>
            <div className="message-row is-reply">
              <span>Auto Reply: Your order is in transit and arriving tomorrow.</span>
            </div>
            <div className="message-grid">
              <article>
                <h3>Templates</h3>
                <p>24 active</p>
              </article>
              <article>
                <h3>Rules</h3>
                <p>11 active</p>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
