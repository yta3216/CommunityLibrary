import { Link, NavLink } from "react-router-dom";
import "./adminPages.css";

const users = [
  {
    id: "USR-1001",
    name: "Sophie Carter",
    email: "sophie.carter@communitylibrary.dev",
    role: "Admin",
    status: "Active",
    borrowed: 1,
    listings: 0,
  },
  {
    id: "USR-1002",
    name: "Daniel Kim",
    email: "daniel.kim@communitylibrary.dev",
    role: "Verified",
    status: "Active",
    borrowed: 3,
    listings: 2,
  },
  {
    id: "USR-1003",
    name: "Priya Patel",
    email: "priya.patel@communitylibrary.dev",
    role: "User",
    status: "Suspended",
    borrowed: 0,
    listings: 1,
  },
  {
    id: "USR-1004",
    name: "Miguel Santos",
    email: "miguel.santos@communitylibrary.dev",
    role: "User",
    status: "Active",
    borrowed: 2,
    listings: 4,
  },
];

export default function AdminUsers() {
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
            placeholder="Search users, email, role..."
          />
          <span className="admin-chip">Admin name</span>
          <Link className="admin-chip admin-link" to="/login">
            Log Out
          </Link>
        </header>

        <div className="admin-divider" />

        <h1 className="admin-title">Manage Users</h1>
        <p className="admin-subtitle">
          Admin view of users. Toggle status, change role (UI only). Later
          connect to authentication + database.
        </p>

        <section className="admin-card">
          <div className="admin-row">
            <div>
              <h2 className="admin-card-title">Users</h2>
              <p className="admin-card-note">
                Front-end demo (swap arrays with DB later)
              </p>
            </div>
            <div className="admin-actions">
              <button type="button" className="admin-button">
                Add User
              </button>
              <button type="button" className="admin-button light">
                Export (CSV)
              </button>
            </div>
          </div>

          <div className="admin-filters">
            <input className="admin-input" placeholder="Name, email, role..." />
            <select className="admin-select" defaultValue="All">
              <option>All</option>
              <option>Admin</option>
              <option>Verified</option>
              <option>User</option>
            </select>
            <select className="admin-select" defaultValue="All">
              <option>All</option>
              <option>Active</option>
              <option>Suspended</option>
            </select>
            <div className="admin-actions">
              <button type="button" className="admin-button light">
                Clear
              </button>
              <button type="button" className="admin-button">
                Apply
              </button>
            </div>
          </div>
        </section>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Borrowed</th>
                <th>Listings</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                    <div className="admin-card-note">
                      {user.email} • {user.id}
                    </div>
                  </td>
                  <td>
                    <span className="admin-pill">{user.role}</span>
                  </td>
                  <td>
                    <span className="admin-pill">{user.status}</span>
                  </td>
                  <td>
                    <strong>{user.borrowed}</strong>
                  </td>
                  <td>
                    <strong>{user.listings}</strong>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button type="button" className="admin-button light">
                        View
                      </button>
                      <button type="button" className="admin-button light">
                        Toggle Status
                      </button>
                      <button type="button" className="admin-button light">
                        Cycle Role
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pending DB integration:
						- GET /admin/users for rows and counters
						- PATCH /admin/users/:id for status/role updates
						- Authentication + role guard for admin-only access */}
      </div>
    </div>
  );
}
