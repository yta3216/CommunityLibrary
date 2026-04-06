import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBooks } from "../../api/books";
import { getUsers } from "../../api/users";
import AdminLayout from "./AdminLayout";
import BooksStatusChart from "./charts/BooksStatusChart";
import GenreBreakdownChart from "./charts/GenreBreakdownChart";
import UserStatusChart from "./charts/UserStatusChart";
import "./AdminPages.css";

export default function AdminHome() {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [usersData, booksData] = await Promise.all([getUsers(), getBooks()]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch (_error) {
      alert(_error?.message || "Could not reach server.");
    } finally {
      setIsLoading(false);
    }
  }, []);
 
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const metrics = useMemo(() => {
    const availableBooks = books.filter(
      (book) => String(book.status || "").toLowerCase() === "available"
    ).length;
 
    const suspendedUsers = users.filter(
      (user) => String(user.status || "").toLowerCase() === "suspended"
    ).length;
 
    return {
      totalListings: books.length,
      availableBooks,
      notAvailableBooks: books.length - availableBooks,
      totalUsers: users.length,
      suspendedUsers,
    };
  }, [books, users]);
 
  const recentBooks = useMemo(() => {
    return [...books]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [books]);
  
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
          <p className="text-muted-xs admin-card-note">Total Users</p>
          <p className="admin-metric-value">{metrics.totalUsers}</p>
          <p className="text-muted-xs admin-card-note">
            {metrics.suspendedUsers > 0
              ? `${metrics.suspendedUsers} suspended`
              : "All active"}</p>
        </div>
      </section>

        {!isLoading && (
        <section className="admin-grid-3">
          <BooksStatusChart books={books} />
          <GenreBreakdownChart books={books} />
          <UserStatusChart users={users} />
        </section>
      )}
      
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
                    <p className="text-muted-xs admin-card-note">
                      Listed: {new Date(
                        book.createdAt
                          ? book.createdAt
                          : parseInt(String(book._id).substring(0, 8), 16) * 1000
                      ).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
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