import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../resources/logo.png";
import { useAuth } from "../context/AuthContext";
import { getBooks } from "../api/books";
import { getUsers } from "../api/users";
import "./adminPages.css";

export default function AdminHome() {
  const { user: currentUser, signOut } = useAuth();
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAdminHome = async () => {
      try {
        setIsLoading(true);

        const [usersData, booksData] = await Promise.all([
          getUsers(),
          getBooks(),
        ]);

        if (!isMounted) {
          return;
        }

        setUsers(Array.isArray(usersData) ? usersData : []);
        setBooks(Array.isArray(booksData) ? booksData : []);
      } catch (_error) {
        if (isMounted) {
          alert(_error?.message || "Could not reach server.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAdminHome();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const availableBooks = books.filter(
      (book) => String(book.status || "").toLowerCase() === "available",
    ).length;

    return {
      totalListings: books.length,
      availableBooks,
      notAvailableBooks: books.length - availableBooks,
      totalUsers: users.length,
    };
  }, [books, users]);

  const recentBooks = useMemo(() => books.slice(0, 5), [books]);

  const handleLogout = () => {
    signOut();
    window.location.assign("/login");
  };

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <header className="admin-topbar">
          <img
            src={logo}
            alt="Community Library logo"
            style={{ width: 42, height: 42, objectFit: "contain" }}
          />
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
          <div className="admin-topbar-right">
            <span className="admin-chip">
              {currentUser?.username || "Admin"}
            </span>
            <button
              type="button"
              className="admin-chip admin-link"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </header>

        <div className="admin-divider" />

        <h1 className="admin-title">Admin Dashboard</h1>
        <p className="admin-subtitle">
          Manage listings, users, and current availability in one place.
        </p>

        <section className="admin-metrics">
          <div className="admin-card">
            <p className="admin-card-note">Total Listings</p>
            <p className="admin-metric-value">{metrics.totalListings}</p>
            <p className="admin-card-note">All books in the system</p>
          </div>
          <div className="admin-card">
            <p className="admin-card-note">Available</p>
            <p className="admin-metric-value">{metrics.availableBooks}</p>
            <p className="admin-card-note">Books currently with owner</p>
          </div>
          <div className="admin-card">
            <p className="admin-card-note">Not Available</p>
            <p className="admin-metric-value">{metrics.notAvailableBooks}</p>
            <p className="admin-card-note">Books currently with borrower</p>
          </div>
          <div className="admin-card">
            <p className="admin-card-note">Users</p>
            <p className="admin-metric-value">{metrics.totalUsers}</p>
            <p className="admin-card-note">Total registered users</p>
          </div>
        </section>

        <section className="admin-grid-2">
          <div className="admin-card">
            <h2 className="admin-card-title">Quick Actions</h2>
            <p className="admin-card-note">Common admin navigation</p>
            <div className="admin-actions" style={{ marginTop: 14 }}>
              <Link to="/admin/books" className="admin-button admin-link">
                Manage Books
              </Link>
              <Link to="/admin/users" className="admin-button admin-link">
                Manage Users
              </Link>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-row">
              <h2 className="admin-card-title">Recent Listings</h2>
              <span className="admin-chip">Live</span>
            </div>
            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              {isLoading ? (
                <p className="admin-card-note">Loading...</p>
              ) : recentBooks.length === 0 ? (
                <p className="admin-card-note">No listings yet.</p>
              ) : (
                recentBooks.map((book) => {
                  const ownerName =
                    typeof book.owner === "object"
                      ? book.owner?.username
                      : "Unknown";

                  return (
                    <div
                      key={book._id}
                      className="admin-card"
                      style={{ padding: 12, boxShadow: "none" }}
                    >
                      <div className="admin-row" style={{ marginBottom: 0 }}>
                        <strong>{book.title || "Untitled"}</strong>
                        <span className="admin-card-note">
                          {String(book.status || "").toUpperCase()}
                        </span>
                      </div>
                      <p className="admin-card-note" style={{ marginTop: 6 }}>
                        Owner: {ownerName || "Unknown"}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
