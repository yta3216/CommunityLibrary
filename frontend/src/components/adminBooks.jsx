import { Link, NavLink } from "react-router-dom";
import "./adminPages.css";

export default function AdminBooks() {
  const listings = [
    {
      id: "B-1001",
      title: "Dune",
      genre: "Sci-fi",
      owner: "Sam Bueno",
      status: "Borrowed",
      holder: "Ava Chen",
      updated: "2026-02-06",
    },
    {
      id: "B-1002",
      title: "The Hobbit",
      genre: "Fantasy",
      owner: "Leo Martin",
      status: "Traded",
      holder: "Leo Martin",
      updated: "2026-02-05",
    },
    {
      id: "B-1003",
      title: "Pride & Prejudice",
      genre: "Romance",
      owner: "Noah Patel",
      status: "Available",
      holder: "Noah Patel",
      updated: "2026-02-02",
    },
    {
      id: "B-1004",
      title: "It",
      genre: "Horror",
      owner: "Ava Chen",
      status: "Exchanged",
      holder: "Mia Silva",
      updated: "2026-02-01",
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
            placeholder="Search listings, owner, borrower..."
          />
          <span className="admin-chip">Admin name</span>
          <Link className="admin-chip admin-link" to="/login">
            Log Out
          </Link>
        </header>

        <div className="admin-divider" />

        <h1 className="admin-title">Manage Books</h1>
        <p className="admin-subtitle">
          Admin view of listings. See status (available / borrowed / traded /
          exchanged) and who currently holds the book.
        </p>

        <section className="admin-card">
          <div className="admin-row">
            <div>
              <h2 className="admin-card-title">Listings</h2>
              <p className="admin-card-note">
                Front-end demo (swap arrays with DB later)
              </p>
            </div>
            <div className="admin-actions">
              <button type="button" className="admin-button">
                Add Listing
              </button>
              <button type="button" className="admin-button light">
                Export (CSV)
              </button>
            </div>
          </div>

          <div className="admin-filters">
            <input
              className="admin-input"
              placeholder="Title, owner, borrower..."
            />
            <select className="admin-select" defaultValue="All">
              <option>All</option>
              <option>Available</option>
              <option>Borrowed</option>
              <option>Traded</option>
              <option>Exchanged</option>
            </select>
            <select className="admin-select" defaultValue="All">
              <option>All</option>
              <option>Sci-fi</option>
              <option>Fantasy</option>
              <option>Romance</option>
              <option>Horror</option>
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
                <th>Book</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Held By</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((book) => (
                <tr key={book.id}>
                  <td>
                    <strong>{book.title}</strong>
                    <div className="admin-card-note">
                      {book.genre} • {book.id}
                    </div>
                  </td>
                  <td>
                    <strong>{book.owner}</strong>
                  </td>
                  <td>
                    <span className="admin-pill">{book.status}</span>
                  </td>
                  <td>{book.holder}</td>
                  <td>{book.updated}</td>
                  <td>
                    <button type="button" className="admin-button light">
                      Toggle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pending DB integration:
						- GET /admin/books for rows
						- PATCH /admin/books/:id for status changes
						- POST /admin/books for add listing
						- Owner changes only through approved swap flow */}
      </div>
    </div>
  );
}
