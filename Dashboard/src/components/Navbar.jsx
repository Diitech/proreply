import { SITE_CONTENT } from "../content/siteContent";
import logo from "../assets/icon-32.png";

function handleNavClick(event, href) {
  if (!href.startsWith("#")) {
    return;
  }

  event.preventDefault();
  const target = document.querySelector(href);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function Navbar() {
  return (
    <header className="site-header">
      <div className="container nav-shell">
        <a className="brand" href="#top">
          <img className="brand-logo" src={logo} alt={SITE_CONTENT.companyName} />
          <span>{SITE_CONTENT.companyName}</span>
        </a>
        <nav aria-label="Primary navigation">
          <ul className="nav-list">
            {SITE_CONTENT.navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(event) => handleNavClick(event, item.href)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="button button-small" href={SITE_CONTENT.ctas.install.href}>
          {SITE_CONTENT.ctas.install.label}
        </a>
      </div>
    </header>
  );
}

export default Navbar;
