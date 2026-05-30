import { SITE_CONTENT } from "../content/siteContent";

function FAQ() {
  return (
    <section id="faq" className="section alt-background">
      <div className="container faq-wrap">
        <p className="eyebrow">FAQ</p>
        <h2>Answers to common questions</h2>
        <div className="faq-list">
          {SITE_CONTENT.faqs.map((item) => (
            <details key={item.question} className="faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
