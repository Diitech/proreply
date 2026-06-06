import { Link } from "react-router-dom";

function GuidePage() {
  return (
    <section className="section doc-page">
      <div className="container doc-shell">
        <article className="doc-card">
          <h1 className="doc-title">How to Use ProReply</h1>
          <p className="doc-subtitle">
            Your complete guide to automating WhatsApp Web replies
          </p>

          <h2 className="doc-step-heading">
            <span className="doc-step-number">1</span>
            Set Up Your Business Profile
          </h2>
          <p className="doc-paragraph">
            First, fill in your business details. This creates a professional
            signature that gets added to every auto-reply.
          </p>
          <ul className="doc-list">
            <li>Click the ProReply icon in your browser toolbar</li>
            <li>Expand the Business Profile section</li>
            <li>Enter your Business Name and Email</li>
            <li>Add your Phone Number (optional)</li>
            <li>Your signature preview updates automatically</li>
          </ul>
          <div className="doc-tip">
            <strong>Tip:</strong> The signature is automatically appended to every
            template. It looks professional and builds trust.
          </div>

          <h2 className="doc-step-heading">
            <span className="doc-step-number">2</span>
            Create Message Templates
          </h2>
          <p className="doc-paragraph">
            Templates are pre-written messages that get sent automatically. Think
            of them as canned responses.
          </p>
          <ul className="doc-list">
            <li>Expand the Message Templates section</li>
            <li>Click Add New Template</li>
            <li>Give it a name (for example, Price Inquiry)</li>
            <li>Write the message content</li>
            <li>
              Use placeholders like <span className="doc-code">{"{{name}}"}</span>
              to personalize
            </li>
          </ul>
          <div className="doc-tip">
            <strong>Available placeholders:</strong>
            <span className="doc-code">{"{{name}}"}</span>,
            <span className="doc-code">{"{{date}}"}</span>,
            <span className="doc-code">{"{{time}}"}</span>,
            <span className="doc-code">{"{{order_id}}"}</span>
          </div>

          <h2 className="doc-step-heading">
            <span className="doc-step-number">3</span>
            Create Automation Rules
          </h2>
          <p className="doc-paragraph">
            Rules connect incoming messages to your templates. When someone sends
            a message containing a keyword, ProReply automatically responds.
          </p>
          <ul className="doc-list">
            <li>Expand the Automation Rules section</li>
            <li>Click Add New Rule</li>
            <li>Enter a trigger keyword (for example, price, hello, order)</li>
            <li>
              Choose a match type:
              <ul className="doc-list">
                <li>Contains the word, matches anywhere in the message</li>
                <li>Exact match only, message must be exactly the keyword</li>
                <li>Starts with, message must start with the keyword</li>
              </ul>
            </li>
            <li>Select which template to send</li>
            <li>Toggle the rule ON or OFF anytime</li>
          </ul>

          <h2 className="doc-step-heading">
            <span className="doc-step-number">4</span>
            Open WhatsApp Web
          </h2>
          <p className="doc-paragraph">
            ProReply only works when WhatsApp Web is open in your browser.
          </p>
          <ul className="doc-list">
            <li>
              Go to {" "}
              <a href="https://web.whatsapp.com" target="_blank" rel="noreferrer">
                web.whatsapp.com
              </a>
            </li>
            <li>Scan the QR code with your phone</li>
            <li>Keep the tab open (you can minimize it)</li>
            <li>ProReply will show a green dot when WhatsApp is detected</li>
          </ul>
          <div className="doc-warning">
            <strong>Important:</strong> Do not close the WhatsApp Web tab. You
            can minimize the browser window, but the tab must stay open for
            auto-replies to work.
          </div>

          <h2 className="doc-step-heading">
            <span className="doc-step-number">5</span>
            Enable Auto-Reply
          </h2>
          <p className="doc-paragraph">
            Toggle the main switch at the top of the popup to turn automation ON
            or OFF.
          </p>
          <ul className="doc-list">
            <li>
              <strong>Green dot + Active</strong> means ProReply is monitoring and
              auto-replying
            </li>
            <li>
              <strong>Orange dot + Paused</strong> means ProReply is idle with no
              auto-replies
            </li>
            <li>Click the status badge to quickly toggle</li>
          </ul>

          <h2 className="doc-step-heading">
            <span className="doc-step-number">6</span>
            Backup and Restore (Free Plan)
          </h2>
          <p className="doc-paragraph">
            Use the <strong>Backup Data</strong> and <strong>Restore Data</strong>
            buttons to save your templates and rules.
          </p>
          <ul className="doc-list">
            <li>Backup downloads a JSON file with all your data</li>
            <li>Restore lets you upload that JSON file to recover everything</li>
            <li>Perfect when switching computers or reinstalling the extension</li>
            <li>Pro plan status is not restored from backups (security)</li>
          </ul>

          <h2 className="doc-heading">Free vs Pro Plan</h2>
          <table className="doc-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free</th>
                <th>Pro</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Auto-replies per day</td>
                <td>10</td>
                <td className="doc-positive">Unlimited</td>
              </tr>
              <tr>
                <td>Templates</td>
                <td>3</td>
                <td className="doc-positive">Unlimited</td>
              </tr>
              <tr>
                <td>Delayed replies</td>
                <td>-</td>
                <td className="doc-positive">Yes</td>
              </tr>
              <tr>
                <td>Cloud backup</td>
                <td>-</td>
                <td className="doc-positive">Yes</td>
              </tr>
            </tbody>
          </table>

          <div className="doc-tip">
            <strong>Payment:</strong> Pro plan costs N5,000/month (about $3.30
            USD). Pay securely with Flutterwave using card, USSD, bank transfer,
            or mobile money.
          </div>

          <Link className="doc-home-btn" to="/">
            Back to Home
          </Link>
        </article>

        <div className="doc-meta">ProReply v1.0.0 - Made for busy business owners</div>
      </div>
    </section>
  );
}

export default GuidePage;
