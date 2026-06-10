import { NavLink } from "react-router-dom";
import "./MobileNav.css";

export function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="Mobile">
      <NavLink to="/" end className="mobile-nav__item">
        <span className="mobile-nav__icon">⌂</span>
        <span>Home</span>
      </NavLink>
      <NavLink to="/browse" className="mobile-nav__item">
        <span className="mobile-nav__icon">▦</span>
        <span>Browse</span>
      </NavLink>
      <NavLink to="/search" className="mobile-nav__item">
        <span className="mobile-nav__icon">⌕</span>
        <span>Search</span>
      </NavLink>
    </nav>
  );
}
