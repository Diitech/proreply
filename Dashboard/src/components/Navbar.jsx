import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { SITE_CONTENT } from "../content/siteContent";
import logo from "../assets/logo1.png";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname, location.hash]);

  const handleSectionClick = (event, href) => {
    if (location.pathname !== "/") {
      return;
    }
    handleNavClick(event, href);
    setIsMenuOpen(false);
  };

  const handleRouteClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="container nav-shell">
        <Link className="brand" to="/">
          <img className="brand-logo" src={logo} alt={SITE_CONTENT.companyName} />
          <span>{SITE_CONTENT.companyName}</span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
        </button>

        <nav
          id="primary-navigation"
          className={`primary-nav ${isMenuOpen ? "is-open" : ""}`}
          aria-label="Primary navigation"
        >
          <ul className="nav-list">
            {SITE_CONTENT.navItems.map((item) => {
              if (item.href.startsWith("#")) {
                const linkTarget = `/${item.href}`;
                return (
                  <li key={item.href}>
                    {location.pathname === "/" ? (
                      <a
                        href={item.href}
                        onClick={(event) => handleSectionClick(event, item.href)}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link to={linkTarget} onClick={handleRouteClick}>
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    onClick={handleRouteClick}
                    className={({ isActive }) => (isActive ? "is-active" : undefined)}
                  >
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <a className="button button-small nav-cta" href={SITE_CONTENT.ctas.install.href}>
          {SITE_CONTENT.ctas.install.label}
        </a>
      </div>
    </header>
  );
}

export default Navbar;
