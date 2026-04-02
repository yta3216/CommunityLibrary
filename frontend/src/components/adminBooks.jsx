import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../resources/logo.png";
import { useAuth } from "../context/AuthContext";
import { createBook, deleteBook, getBooks, toggleBookStatus } from "../api/books";
import "./adminPages.css";

export default function AdminBooks() {
  const { user: currentUser, signOut } = useAuth();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [formValues, setFormValues] = useState({
    isbn: "",
    title: "",
    author: "",
    genre: "",
    description: "",
  });

  const loadAdminBooks = useCallback(async (isMountedRef) => {
    try {
      setIsLoading(true);

      const booksData = await getBooks();

      if (!isMountedRef()) {
        return;
      }

      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch (_error) {
      if (isMountedRef()) {
        alert(_error?.message || "Could not reach server.");
      }
    } finally {
      if (isMountedRef()) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    loadAdminBooks(() => isMounted);

    return () => {
      isMounted = false;
    };
  }, [loadAdminBooks]);

  const rows = useMemo(() => {
    return books.map((book) => {
      const ownerName =
        typeof book.owner === "object" ? book.owner?.username : "Unknown";

      const holderName =
        typeof book.holder === "object" ? book.holder?.username : "Unknown";

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
      const isAvailable =
        row.status === "AVAILABLE" || row.status === "WITH_OWNER";
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

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    const isbn = formValues.isbn.trim();
    const title = formValues.title.trim();
    const author = formValues.author.trim();
    const genre = formValues.genre.trim();
    const description = formValues.description.trim();

    if (!isbn || !title || !author || !genre || !description) {
      alert("All fields are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createBook({ isbn, title, author, genre, description });

      setBooks((prev) => [result, ...prev]);
      setFormValues({
        isbn: "",
        title: "",
        author: "",
        genre: "",
        description: "",
      });
      setIsCreateOpen(false);
    } catch (_error) {
      alert(_error?.message || "Could not reach server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBook = async (bookId) => {
    setIsActing(true);
    try {
      const result = await toggleBookStatus(bookId);

      setBooks((prev) =>
        prev.map((book) => (book._id === bookId ? result : book)),
      );
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

        <h1 className="admin-title">Manage Books</h1>
        <p className="admin-subtitle">
          Admin view of listings, ownership, and availability.
        </p>

        <section className="admin-card">
          <div className="admin-row">
            <div>
              <h2 className="admin-card-title">Listings</h2>
              <p className="admin-card-note">
                {isLoading ? "Loading books..." : "Live data"}
              </p>
            </div>
            <div className="admin-actions">
              <button
                type="button"
                className="admin-button"
                onClick={() => {
                  setIsCreateOpen(true);
                }}
              >
                Add Listing
              </button>
            </div>
          </div>

          <div className="admin-filters">
            <input
              className="admin-input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Title, owner, borrower..."
            />
            <select
              className="admin-select"
              value={availabilityFilter}
              onChange={(event) => setAvailabilityFilter(event.target.value)}
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
                  <td colSpan={5} className="admin-card-note">
                    No books match this filter.
                  </td>
                </tr>
              ) : (
                filteredRows.map((book) => (
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
          <div style={styles.modalBackdrop}>
            <div style={styles.modalCard}>
              <h3 style={styles.modalTitle}>Add Listing</h3>

              <form onSubmit={handleCreateSubmit} style={styles.formGrid}>
                <input
                  name="isbn"
                  value={formValues.isbn}
                  onChange={handleCreateChange}
                  placeholder="ISBN"
                  style={styles.textInput}
                />
                <input
                  name="title"
                  value={formValues.title}
                  onChange={handleCreateChange}
                  placeholder="Title"
                  style={styles.textInput}
                />
                <input
                  name="author"
                  value={formValues.author}
                  onChange={handleCreateChange}
                  placeholder="Author"
                  style={styles.textInput}
                />
                <input
                  name="genre"
                  value={formValues.genre}
                  onChange={handleCreateChange}
                  placeholder="Genre"
                  style={styles.textInput}
                />
                <textarea
                  name="description"
                  value={formValues.description}
                  onChange={handleCreateChange}
                  placeholder="Description"
                  style={styles.textArea}
                />

                <div
                  className="admin-actions"
                  style={{ justifyContent: "flex-end" }}
                >
                  <button
                    type="button"
                    className="admin-button light"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add Listing"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const styles = {
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  },
  modalCard: {
    width: "100%",
    maxWidth: "560px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 14px 32px rgba(0,0,0,0.22)",
  },
  modalTitle: {
    margin: "0 0 14px",
    fontSize: "24px",
    fontWeight: 700,
  },
  formGrid: {
    display: "grid",
    gap: "10px",
  },
  textInput: {
    border: "1px solid #d0d5dd",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "14px",
  },
  textArea: {
    minHeight: "90px",
    border: "1px solid #d0d5dd",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "14px",
    resize: "vertical",
  },
};
