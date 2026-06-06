import { SITE_CONTENT } from "../content/siteContent";

function Pricing() {
  return (
    <section id="pricing" className="section">
      <div className="container">
        <p className="eyebrow">Pricing</p>
        <h2>Start free. Upgrade when your workflow grows.</h2>
        <div className="pricing-grid">
          <article className="card price-card">
            <p className="price-plan">{SITE_CONTENT.pricing.free.name}</p>
            <p className="price">{SITE_CONTENT.pricing.free.price}</p>
            <ul className="simple-list">
              {SITE_CONTENT.pricing.free.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="card price-card featured">
            <p className="price-plan">{SITE_CONTENT.pricing.pro.name}</p>
            <p className="price">{SITE_CONTENT.pricing.pro.price}</p>
            <ul className="simple-list">
              {SITE_CONTENT.pricing.pro.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a className="button" href={SITE_CONTENT.ctas.install.href}>
              {SITE_CONTENT.ctas.pricing.label}
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}

export default Pricing;
