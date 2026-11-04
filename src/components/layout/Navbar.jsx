import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import devsphereLogoLight from "/images/devsphere-logo-light.png";
import devsphereLogoDark from "/images/devsphere-logo-dark.png";

const navItems = [
  ["/", "Home"],
  ["/blogs", "Blogs"],
  ["/developers", "Developers"],
  ["/projects", "Projects"],
  ["/about", "About"],
];

export function Navbar() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Click outside listener for user dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate("/");
  };

  const displayName = currentUser ? currentUser.split("@")[0] : "";
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "U";

  return (
    <header className="navbar">
      <NavLink className="logo-brand-link" to="/" aria-label="DevSphere Home">
        <img
          src={theme === "dark" ? devsphereLogoDark : devsphereLogoLight}
          alt="DevSphere Logo"
          className="navbar-brand-logo"
        />
      </NavLink>

      {/* Desktop Navigation */}
      <nav className="desktop-nav">
        {navItems.map(([to, label]) => (
          <NavLink
            key={to}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            to={to}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Right Actions */}
      <div className="nav-actions">
        {/* Search */}
        <div className="search-wrapper">
          <svg className="search-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            aria-label="Site search"
            placeholder="Search DevSphere..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                navigate(`/projects?q=${encodeURIComponent(e.target.value.trim())}`);
              }
            }}
          />
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            /* Sun Icon */
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            /* Moon Icon */
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* User Account Capsule / Auth Links */}
        {isAuthenticated ? (
          <div className="user-menu-wrapper" ref={dropdownRef}>
            <button
              type="button"
              className={`user-capsule ${dropdownOpen ? "open" : ""}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <span className="user-avatar">{initial}</span>
              <span className="user-name">{displayName}</span>
              <svg
                className={`chevron-icon ${dropdownOpen ? "rotated" : ""}`}
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="user-dropdown-menu" role="menu">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">{initial}</div>
                  <div className="dropdown-user-details">
                    <strong>{displayName}</strong>
                    <span className="dropdown-email">{currentUser}</span>
                  </div>
                </div>

                <div className="dropdown-divider" />

                <NavLink to="/developer-profile" className="dropdown-item" role="menuitem">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </NavLink>

                <NavLink to="/projects" className="dropdown-item" role="menuitem">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Community Projects
                </NavLink>

                <NavLink to="/write-blog" className="dropdown-item" role="menuitem">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Write an Article
                </NavLink>

                <NavLink to="/write-project" className="dropdown-item" role="menuitem">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Submit a Project
                </NavLink>

                <div className="dropdown-divider" />

                <button
                  type="button"
                  className="dropdown-item danger"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-actions">
            <NavLink className="btn-ghost btn-sm" to="/login">
              Log in
            </NavLink>
            <NavLink className="btn-primary btn-sm" to="/signup">
              Sign up
            </NavLink>
          </div>
        )}

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          className={`mobile-menu-btn ${mobileMenuOpen ? "open" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-over Drawer */}
      <div className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-drawer-header">
          <NavLink className="logo" to="/" onClick={() => setMobileMenuOpen(false)}>
            <span className="logo-badge">&lt;/&gt;</span>
            <span className="logo-text">Dev<span>Sphere</span></span>
          </NavLink>
          <button
            type="button"
            className="mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="mobile-nav-links">
          {navItems.map(([to, label]) => (
            <NavLink
              key={to}
              className={({ isActive }) => (isActive ? "mobile-nav-link active" : "mobile-nav-link")}
              to={to}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mobile-drawer-footer">
          {isAuthenticated ? (
            <div className="mobile-user-box">
              <div className="mobile-user-info">
                <span className="user-avatar">{initial}</span>
                <div>
                  <strong>{displayName}</strong>
                  <p>{currentUser}</p>
                </div>
              </div>
              <NavLink to="/developer-profile" className="btn-secondary btn-full btn-sm" style={{ marginTop: "12px", textDecoration: "none" }}>
                View My Profile
              </NavLink>
              <button
                type="button"
                className="btn-danger btn-full btn-sm"
                onClick={handleLogout}
                style={{ marginTop: "8px" }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="mobile-auth-buttons">
              <NavLink to="/login" className="btn-secondary btn-full">
                Log In
              </NavLink>
              <NavLink to="/signup" className="btn-primary btn-full">
                Create Account
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
