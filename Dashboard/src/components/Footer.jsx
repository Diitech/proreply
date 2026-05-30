import { SITE_CONTENT } from "../content/siteContent";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-shell">
        <p>{SITE_CONTENT.companyName}</p>
        <a href={`mailto:${SITE_CONTENT.footer.supportEmail}`}>
          {SITE_CONTENT.footer.supportEmail}
        </a>
        <a href={SITE_CONTENT.footer.privacyHref}>Privacy Policy</a>
        <a href={SITE_CONTENT.footer.termsHref}>Terms of Service</a>
        <a href={SITE_CONTENT.footer.storeHref}>Chrome Web Store</a>
      </div>
    </footer>
  );
}

export default Footer;
