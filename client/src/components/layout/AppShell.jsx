import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard / Home" },
  { to: "/buses", label: "Buses / Bus" },
  { to: "/problem-buses", label: "Problem / Alert" },
  { to: "/diesel", label: "Diesel / Fuel" },
  { to: "/drivers", label: "Drivers / Driver" }
];

export function AppShell({ user, onLogout, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="brand-kicker">Fleet App / Gaadi App</p>
          <h1>FleetFlow</h1>
          <p className="sidebar-copy">
            Bus, diesel aur driver ka simple daily control.
          </p>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="profile-card">
          <p className="profile-name">{user?.name}</p>
          <p className="profile-role">{user?.role}</p>
          <button className="secondary-button" onClick={onLogout}>
            Logout / Bahar
          </button>
        </div>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}
