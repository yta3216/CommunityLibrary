import { Link, NavLink } from "react-router-dom";
import "./adminPages.css";

export default function AdminHome() {
  const activity = [
    { title: "Borrowed", text: '"Dune" borrowed by Ava Chen', time: "2h ago" },
    {
      title: "Trade Completed",
      text: '"The Hobbit" traded: Sam → Leo',
      time: "6h ago",
    },
    {
      title: "User Flagged",
      text: "Multiple no-show meetups (demo)",
      time: "Yesterday",
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <header className="admin-topbar">
          <div className="admin-logo-placeholder">Logo</div>
          <nav className="admin-nav">
            <NavLink
              to="/admin/home"
              className={({ isActive }) =>
                `admin-nav-link${isActive ? " active" : ""}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/admin/books"
              className={({ isActive }) =>
                `admin-nav-link${isActive ? " active" : ""}`
              }
            >
              Books
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `admin-nav-link${isActive ? " active" : ""}`
              }
            >
              Users
            </NavLink>
          </nav>
          <input
            className="admin-search"
            placeholder="Search listings, users, borrower..."
          />
          <span className="admin-chip">Admin name</span>
          <Link className="admin-chip admin-link" to="/login">
            Log Out
          </Link>
        </header>

        <div className="admin-divider" />

        <h1 className="admin-title">Admin Dashboard</h1>
        <p className="admin-subtitle">
          Manage listings, users, and live status (borrowed / traded /
          exchanged) in one place.
        </p>

        <section className="admin-metrics">
          <div className="admin-card">
            <p className="admin-card-note">Total Listings</p>
            <p className="admin-metric-value">4</p>
            <p className="admin-card-note">All books in the system</p>
          </div>
          <div className="admin-card">
            <p className="admin-card-note">Borrowed</p>
            <p className="admin-metric-value">1</p>
            <p className="admin-card-note">Currently out with a user</p>
          </div>
          <div className="admin-card">
            <p className="admin-card-note">Traded</p>
            <p className="admin-metric-value">1</p>
            <p className="admin-card-note">Ownership changed hands</p>
          </div>
          <div className="admin-card">
            <p className="admin-card-note">Exchanged</p>
            <p className="admin-metric-value">1</p>
            <p className="admin-card-note">Swap completed</p>
          </div>
        </section>

        <section className="admin-grid-2">
          <div className="admin-card">
            <h2 className="admin-card-title">Quick Actions</h2>
            <p className="admin-card-note">
              Common admin actions (front-end only)
            </p>
            <div className="admin-actions" style={{ marginTop: 14 }}>
              <Link to="/admin/books" className="admin-button admin-link">
                Manage Books
              </Link>
              <Link to="/admin/users" className="admin-button admin-link">
                Manage Users
              </Link>
              <button type="button" className="admin-button dark">
                Lockdown Mode
              </button>
            </div>
            <p className="admin-card-note" style={{ marginTop: 16 }}>
              Some text
            </p>
          </div>

          <div className="admin-card">
            <div className="admin-row">
              <h2 className="admin-card-title">
                Recent Activity (visual only)
              </h2>
              <span className="admin-chip">Today</span>
            </div>
            <p className="admin-card-note">
              Sample feed for your screenshot aesthetic
            </p>
            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              {activity.map((item) => (
                <div
                  key={item.title}
                  className="admin-card"
                  style={{ padding: 12, boxShadow: "none" }}
                >
                  <div className="admin-row" style={{ marginBottom: 0 }}>
                    <strong>{item.title}</strong>
                    <span className="admin-card-note">{item.time}</span>
                  </div>
                  <p className="admin-card-note" style={{ marginTop: 6 }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pending DB integration:
						- Fetch dashboard counters from backend
						- Replace static activity with API events
						- Wire quick actions to authenticated admin endpoints */}
      </div>
    </div>
  );
}
