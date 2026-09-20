import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const navItems = [
  ["/", "Home"],
  ["/blogs", "Blogs"],
  ["/developers", "Developers"],
  ["/projects", "Projects"],
  ["/about", "About"],
];

export function Navbar() {
  const { currentUser, isAuthenticated, logout } = useAuth();

  return (
    <header className="navbar">
      <NavLink className="logo" to="/">
        <b>&lt;/&gt;</b>
        <span>
          Dev<span>Sphere</span>
        </span>
      </NavLink>

      <nav>
        {navItems.map(([to, label]) => (
          <NavLink
            key={to}
            className={({ isActive }) => (isActive ? "active" : "")}
            to={to}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="nav-actions">
        <input aria-label="Site search" placeholder="Search DevSphere..." />
        {isAuthenticated ? (
          <>
            <span className="welcome-tag" title={currentUser}>
              {currentUser.split("@")[0]}
            </span>
            <button className="logout-btn" type="button" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink className="login-link" to="/login">
              Log in
            </NavLink>
            <NavLink className="signup-link" to="/signup">
              Sign up
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
