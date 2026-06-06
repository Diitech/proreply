import { Link } from "react-router-dom";

function PrivacyPage() {
  return (
    <section className="section doc-page">
      <div className="container doc-shell">
        <article className="doc-card">
          <h1 className="doc-title">Privacy Policy</h1>
          <p className="doc-subtitle">Last updated: May 2026</p>

          <div className="doc-highlight">
            <strong>Short version:</strong> ProReply stores everything locally on
            your computer. We do not collect, sell, or share your WhatsApp
            messages, contacts, or business data. Your data is yours.
          </div>

          <h2 className="doc-heading">What Data We Store</h2>
          <p className="doc-paragraph">
            All data is stored locally in your browser using
            <span className="doc-code"> chrome.storage.local </span>. We never
            send your message content to our servers.
          </p>
          <ul className="doc-list">
            <li>
              <strong>Business Profile:</strong> Your business name, email, and
              phone number (used for signatures)
            </li>
            <li>
              <strong>Message Templates:</strong> The text content of templates
              you create
            </li>
            <li>
              <strong>Automation Rules:</strong> Keywords, match types, and
              template associations
            </li>
            <li>
              <strong>Usage Counters:</strong> Daily message count to enforce free
              plan limits
            </li>
            <li>
              <strong>Settings:</strong> Your preferences (notifications,
              auto-start, etc.)
            </li>
          </ul>

          <h2 className="doc-heading">What We Do NOT Store</h2>
          <ul className="doc-list">
            <li>Your WhatsApp messages or chat history</li>
            <li>Your contacts or contact list</li>
            <li>Photos, videos, or media from WhatsApp</li>
            <li>Your WhatsApp login credentials</li>
            <li>Any data from websites other than WhatsApp Web</li>
          </ul>

          <h2 className="doc-heading">How Auto-Reply Works</h2>
          <p className="doc-paragraph">ProReply runs entirely in your browser:</p>
          <ul className="doc-list">
            <li>
              It reads incoming messages from the WhatsApp Web page you have open
            </li>
            <li>It checks if the message matches any of your rules</li>
            <li>
              If matched, it types and sends your template response automatically
            </li>
            <li>
              All processing happens on your computer, nothing is sent to external
              servers
            </li>
          </ul>

          <h2 className="doc-heading">Payment Data (Pro Plan)</h2>
          <p className="doc-paragraph">
            When you upgrade to Pro, payment is handled by
            <strong> Flutterwave</strong>, a secure payment processor. We do not
            store your card details, bank information, or payment passwords.
          </p>
          <ul className="doc-list">
            <li>We only receive confirmation that payment was successful</li>
            <li>
              Your payment information is encrypted and processed by Flutterwave
            </li>
            <li>
              We store only your plan status ("pro" or "free") and expiry date
              locally
            </li>
          </ul>

          <h2 className="doc-heading">Data Export and Import</h2>
          <p className="doc-paragraph">
            The <strong>Backup Data</strong> feature creates a JSON file on your
            computer containing your templates, rules, and settings. This file:
          </p>
          <ul className="doc-list">
            <li>Never leaves your computer unless you manually share it</li>
            <li>Does not include your Pro plan status (for security)</li>
            <li>Can be deleted by you at any time</li>
          </ul>

          <h2 className="doc-heading">Cookies and Tracking</h2>
          <p className="doc-paragraph">
            ProReply does not use cookies, analytics, or tracking pixels. We do
            not know how many messages you send, who you talk to, or what your
            templates say.
          </p>

          <h2 className="doc-heading">Third-Party Services</h2>
          <p className="doc-paragraph">We only connect to:</p>
          <ul className="doc-list">
            <li>
              <strong>Flutterwave</strong> for payment processing (only when you
              click "Pay with Flutterwave")
            </li>
            <li>
              <strong>WhatsApp Web</strong> to read and send messages (only when
              you have the tab open)
            </li>
          </ul>

          <h2 className="doc-heading">Your Rights</h2>
          <p className="doc-paragraph">You can:</p>
          <ul className="doc-list">
            <li>
              Delete all data instantly using the <strong>Clear All Data</strong>
              button in Settings
            </li>
            <li>
              Uninstall the extension at any time. All data is automatically
              removed
            </li>
            <li>Export your data before uninstalling using the Backup feature</li>
            <li>Contact us with privacy questions (see Chrome Web Store listing)</li>
          </ul>

          <h2 className="doc-heading">Changes to This Policy</h2>
          <p className="doc-paragraph">
            If we make changes to this privacy policy, we will update this page
            and notify you through the extension. We will never reduce your
            privacy rights without clear notice.
          </p>

          <Link className="doc-home-btn" to="/">
            Back to Home
          </Link>
        </article>

        <div className="doc-meta">ProReply v1.0.0 - Your privacy is our priority</div>
      </div>
    </section>
  );
}

export default PrivacyPage;
