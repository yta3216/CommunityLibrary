import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBooks } from "../../api/books";
import { getUsers } from "../../api/users";
import AdminLayout from "./AdminLayout";
import "./AdminPages.css";

export default function AdminHome() {
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

  return (
    <AdminLayout>
      <h1 className="heading-lg">Admin Dashboard</h1>
      <p className="text-muted-sm admin-subtitle">
        Manage listings, users, and current availability in one place.
      </p>

      <section className="admin-metrics">
        <div className="admin-card">
          <p className="text-muted-xs admin-card-note">Total Listings</p>
          <p className="admin-metric-value">{metrics.totalListings}</p>
          <p className="text-muted-xs admin-card-note">All books in the system</p>
        </div>
        <div className="admin-card">
          <p className="text-muted-xs admin-card-note">Available</p>
          <p className="admin-metric-value">{metrics.availableBooks}</p>
          <p className="text-muted-xs admin-card-note">Books currently with owner</p>
        </div>
        <div className="admin-card">
          <p className="text-muted-xs admin-card-note">Not Available</p>
          <p className="admin-metric-value">{metrics.notAvailableBooks}</p>
          <p className="text-muted-xs admin-card-note">Books currently with borrower</p>
        </div>
        <div className="admin-card">
          <p className="text-muted-xs admin-card-note">Users</p>
          <p className="admin-metric-value">{metrics.totalUsers}</p>
          <p className="text-muted-xs admin-card-note">Total registered users</p>
        </div>
      </section>

      <section className="admin-grid-2">
        <div className="admin-card">
          <h2 className="heading-md">Quick Actions</h2>
          <p className="text-muted-xs admin-card-note">Common admin navigation</p>
          <div className="admin-actions admin-actions-spaced">
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
            <h2 className="heading-md">Recent Listings</h2>
            <span className="admin-chip">Live</span>
          </div>
          <div className="admin-recent-list">
            {isLoading ? (
              <p className="text-muted-xs admin-card-note">Loading...</p>
            ) : recentBooks.length === 0 ? (
              <p className="text-muted-xs admin-card-note">No listings yet.</p>
            ) : (
              recentBooks.map((book) => {
                const ownerName =
                  typeof book.owner === "object"
                    ? book.owner?.username
                    : "Unknown";

                return (
                  <div
                    key={book._id}
                    className="admin-card admin-card-compact"
                  >
                    <div className="admin-row admin-row-tight">
                      <strong>{book.title || "Untitled"}</strong>
                      <span className="text-muted-xs admin-card-note">
                        {String(book.status || "").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-muted-xs admin-card-note admin-card-note-spaced">
                      Owner: {ownerName || "Unknown"}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </AdminLayout >
  );
}