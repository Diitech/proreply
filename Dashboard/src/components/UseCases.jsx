import { SITE_CONTENT } from "../content/siteContent";

function UseCases() {
  return (
    <section id="use-cases" className="section alt-background">
      <div className="container">
        <p className="eyebrow">Use Cases</p>
        <h2>Built for teams who handle repetitive WhatsApp conversations</h2>
        <div className="use-case-grid">
          {SITE_CONTENT.useCases.map((useCase) => (
            <article className="card" key={useCase}>
              <h3>{useCase}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default UseCases;
