import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../resources/logo.png";
import { useAuth } from "../../context/AuthContext";
import { deleteBook, toggleBookStatus } from "../../api/books";
import BookForm from "../../components/BookForm";
import "./adminPages.css";
import useBooks from "../../hooks/useBooks";

export default function AdminBooks() {
  const { user: currentUser, signOut } = useAuth();
  const [isActing, setIsActing] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const { books, setBooks, isLoading, createBook } = useBooks();

  const rows = useMemo(() => {
    return books.map((book) => {
      const ownerName = typeof book.owner === "object" ? book.owner?.username : "Unknown";
      const holderName = typeof book.holder === "object" ? book.holder?.username : "Unknown";
      return {
        id: book._id,
        title: book.title || "Untitled",
        genre: book.genre || "Unknown",
        owner: ownerName || "Unknown",
        status: String(book.status || "not_available").toUpperCase(),
        holder: holderName || "Unknown",
      };
    });
  }, [books]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return rows.filter((row) => {
      const isAvailable = row.status === "AVAILABLE";
      const matchesAvailability =
        availabilityFilter === "all"
          ? true
          : availabilityFilter === "available"
            ? isAvailable
            : !isAvailable;

      const matchesSearch =
        normalizedQuery.length === 0
          ? true
          : [row.title, row.owner, row.holder, row.id]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

      return matchesAvailability && matchesSearch;
    });
  }, [availabilityFilter, rows, searchQuery]);

  const handleLogout = () => {
    signOut();
    window.location.assign("/login");
  };

  const handleCreateBook = async (values) => {
    await createBook(values);
    setIsCreateOpen(false);
  };

  const handleToggleBook = async (bookId) => {
    setIsActing(true);
    try {
      const result = await toggleBookStatus(bookId);
      setBooks((prev) => prev.map((book) => (book._id === bookId ? result : book)));
    } catch (_error) {
      alert(_error?.message || "Could not reach server.");
    } finally {
      setIsActing(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      await deleteBook(bookId);
      setBooks((prev) => prev.filter((book) => book._id !== bookId));
      alert("Book deleted.");
    } catch (error) {
      alert(error.message || "Could not reach server.");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <header className="admin-topbar">
          <img
            src={logo}
            alt="Community Library logo"
            className="admin-logo"
          />
          <nav className="admin-nav">
            <NavLink
              to="/admin/home"
              className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}
            >
              Home
            </NavLink>
            <NavLink
              to="/admin/books"
              className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}
            >
              Books
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}
            >
              Users
            </NavLink>
          </nav>
          <div className="admin-topbar-right">
            <span className="admin-chip">{currentUser?.username || "Admin"}</span>
            <button type="button" className="admin-chip admin-link" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </header>

        <div className="admin-divider" />

        <h1 className="heading-lg">Manage Books</h1>
        <p className="text-muted-sm admin-subtitle">Admin view of listings, ownership, and availability.</p>

        <section className="admin-card">
          <div className="admin-row">
            <div>
              <h2 className="heading-md">Listings</h2>
              <p className="text-muted-xs admin-card-note">{isLoading ? "Loading books..." : "Live data"}</p>
            </div>
            <div className="admin-actions">
              <button type="button" className="admin-button" onClick={() => setIsCreateOpen(true)}>
                Add Listing
              </button>
            </div>
          </div>

          <div className="admin-filters">
            <input
              className="admin-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Title, owner, borrower..."
            />
            <select
              className="admin-select"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="not_available">Not Available</option>
            </select>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-muted-xs admin-card-note">No books match this filter.</td>
                </tr>
              ) : (
                filteredRows.map((book) => (
                  <tr key={book.id}>
                    <td>
                      <strong>{book.title}</strong>
                      <div className="text-muted-xs admin-card-note">{book.genre} • {book.id}</div>
                    </td>
                    <td><strong>{book.owner}</strong></td>
                    <td><span className="admin-pill">{book.status}</span></td>
                    <td>{book.holder}</td>
                    <td>
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="admin-button light"
                          disabled={isActing}
                          onClick={() => handleToggleBook(book.id)}
                        >
                          Toggle
                        </button>
                        <button
                          type="button"
                          className="admin-button light"
                          disabled={isActing}
                          onClick={() => handleDeleteBook(book.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isCreateOpen ? (
          <BookForm
            onSubmit={handleCreateBook}
            onCancel={() => setIsCreateOpen(false)}
            modalTitle="Add Listing"
          />
        ) : null}
      </div>
    </div>
  );
}