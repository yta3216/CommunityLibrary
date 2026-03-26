import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../resources/logo.png";
import "./adminPages.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5050";

export default function AdminBooks() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createErrorMessage, setCreateErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [formValues, setFormValues] = useState({
    isbn: "",
    title: "",
    author: "",
    genre: "",
    description: "",
  });

  const loadAdminBooks = async (token, isMountedRef) => {
    try {
      setErrorMessage("");
      setIsLoading(true);

      const [meResponse, booksResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/api/books`),
      ]);

      if (!meResponse.ok) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      const meData = await meResponse.json();
      const booksData = booksResponse.ok ? await booksResponse.json() : [];

      if (!isMountedRef()) {
        return;
      }

      setCurrentUser(meData);
      setBooks(Array.isArray(booksData) ? booksData : []);

      if (!booksResponse.ok) {
        setErrorMessage("Could not load books.");
      }
    } catch (_error) {
      if (isMountedRef()) {
        setErrorMessage("Could not reach server.");
      }
    } finally {
      if (isMountedRef()) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    loadAdminBooks(token, () => isMounted);

    return () => {
      isMounted = false;
    };
  }, [navigate]);

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
    localStorage.removeItem("token");
    window.location.assign("/login");
  };

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    setCreateErrorMessage("");

    const isbn = formValues.isbn.trim();
    const title = formValues.title.trim();
    const author = formValues.author.trim();
    const genre = formValues.genre.trim();
    const description = formValues.description.trim();

    if (!isbn || !title || !author || !genre || !description) {
      setCreateErrorMessage("All fields are required.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      handleLogout();
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isbn, title, author, genre, description }),
      });
      const result = await response.json();

      if (!response.ok) {
        setCreateErrorMessage(result.message || "Failed to add listing.");
        return;
      }

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
      setCreateErrorMessage("Could not reach server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBook = async (bookId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleLogout();
      return;
    }

    setIsActing(true);
    setErrorMessage("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/books/${bookId}/toggle-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();

      if (!response.ok) {
        setErrorMessage("Could not toggle book status.");
        return;
      }

      setBooks((prev) =>
        prev.map((book) => (book._id === bookId ? result : book)),
      );
    } catch (_error) {
      setErrorMessage("Could not reach server.");
    } finally {
      setIsActing(false);
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

        {errorMessage ? (
          <p className="admin-card-note">{errorMessage}</p>
        ) : null}

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
                  setCreateErrorMessage("");
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
                      <button
                        type="button"
                        className="admin-button light"
                        disabled={isActing}
                        onClick={() => handleToggleBook(book.id)}
                      >
                        Toggle
                      </button>
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

                {createErrorMessage ? (
                  <p className="admin-card-note" style={{ color: "#b42318" }}>
                    {createErrorMessage}
                  </p>
                ) : null}

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
