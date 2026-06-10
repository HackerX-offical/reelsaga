import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { NavSearch } from "./NavSearch";
import { MobileNav } from "./MobileNav";
import { useShows } from "../context/ShowsContext";
import "./Layout.css";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { shows } = useShows();

  const isHome = location.pathname === "/";
  const isPlayer = /^\/(watch|trailer|clip)\//.test(location.pathname);
  const onHero = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  const navClass = [
    "nav",
    isPlayer && "nav--player",
    onHero && "nav--hero",
    (scrolled || !isHome || isPlayer) && "nav--solid",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`layout ${isPlayer ? "layout--player" : ""} ${isHome ? "layout--home" : ""}`}>
      <header className={navClass}>
        <div className="container nav__inner">
          <Logo compact={isPlayer} />

          {!isPlayer && (
            <nav className="nav__links">
              <NavLink to="/" end>Home</NavLink>
              <NavLink to="/browse">Browse</NavLink>
            </nav>
          )}

          {!isPlayer ? (
            <NavSearch />
          ) : (
            <button
              type="button"
              className="nav__close"
              onClick={() => navigate(-1)}
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      {!isPlayer && (
        <footer className="footer">
          <div className="container footer__inner">
            <Logo />
            <p className="footer__copy">
              {shows.length} shows · Live from api.reelsaga.in
            </p>
          </div>
        </footer>
      )}

      {!isPlayer && <MobileNav />}
    </div>
  );
}
