import { SITE_CONTENT } from "../content/siteContent";

function HowItWorks() {
  return (
    <section id="how-it-works" className="section alt-background">
      <div className="container">
        <p className="eyebrow">How It Works</p>
        <h2>Set up ProReply in minutes</h2>
        <ol className="step-list">
          {SITE_CONTENT.steps.map((step, index) => (
            <li key={step} className="step-item">
              <span className="step-number">{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default HowItWorks;
