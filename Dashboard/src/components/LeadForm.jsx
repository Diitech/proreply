function LeadForm() {
  return (
    <section id="contact" className="section">
      <div className="container">
        <div className="lead-box">
          <div>
            <p className="eyebrow">Stay Updated</p>
            <h2>Get product updates and launch announcements</h2>
            <p>
              Join the ProReply list to receive practical automation tips and feature
              releases.
            </p>
          </div>
          <form className="lead-form" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="email" className="sr-only">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your work email"
              required
            />
            <button type="submit" className="button">
              Join Waitlist
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default LeadForm;
