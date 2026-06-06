import { Link } from "react-router-dom";
import { SITE_CONTENT } from "../content/siteContent";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-shell">
        <p>{SITE_CONTENT.companyName}</p>
        <a href={`mailto:${SITE_CONTENT.footer.supportEmail}`}>
          {SITE_CONTENT.footer.supportEmail}
        </a>
        <Link to={SITE_CONTENT.footer.privacyHref}>Privacy Policy</Link>
        <Link to={SITE_CONTENT.footer.guideHref}>Guide</Link>
        <a href={SITE_CONTENT.footer.storeHref}>Chrome Web Store</a>
      </div>
    </footer>
  );
}

export default Footer;
