function Demo() {
  return (
    <section id="demo" className="section">
      <div className="container demo-grid">
        <div>
          <p className="eyebrow">Demo</p>
          <h2>See ProReply in action</h2>
          <p>
            Watch how incoming messages trigger smart replies, templates are reused,
            and signatures are added instantly.
          </p>
          <ul className="simple-list">
            <li>Auto replies based on message keywords</li>
            <li>One-click template responses</li>
            <li>Automatic business signature injection</li>
          </ul>
        </div>
        <figure className="demo-media">
          <img
            src="/demo-placeholder.svg"
            width="640"
            height="420"
            loading="lazy"
            alt="Demo placeholder showing automated WhatsApp workflow"
          />
        </figure>
      </div>
    </section>
  );
}

export default Demo;
