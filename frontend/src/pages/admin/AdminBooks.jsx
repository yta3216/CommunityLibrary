import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteBook, getBooks, toggleBookStatus } from "../../api/books";
import BookForm from "../../components/BookForm";
import AdminLayout from "./AdminLayout";
import "./AdminPages.css";

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const fetchBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getBooks();
      setBooks(Array.isArray(data) ? data : []);
    } catch (_error) {
      alert(_error?.message || "Could not reach server.");
    } finally {
      setIsLoading(false);
    }
  }, []);
 
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const rows = useMemo(() => {
    return books.map((book) => {
      const ownerName = typeof book.owner === "object" ? book.owner?.username : "Unknown";
      const holderName = typeof book.holder === "object" ? book.holder?.username : "Unknown";
      const status = String(book.status || "not_available").toLowerCase();
      return {
        id: book._id,
        title: book.title || "Untitled",
        genre: book.genre || "Unknown",
        owner: ownerName || "Unknown",
        status,
        holder: holderName || "Unknown",
      };
    });
  }, [books]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesAvailability =
        availabilityFilter === "all"
          ? true
          : availabilityFilter === "available"
            ? row.status === "available"
            : row.status !== "available";

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

  const handleCreateBook = async (values) => {
    try {
      const { createBook } = await import("../../api/books");
      const result = await createBook(values);
      setBooks((prev) => [result, ...prev]);
      setIsCreateOpen(false);
    } catch (_error) {
      alert(_error?.message || "Could not create book.");
    }
  };

  const handleToggleBook = async (bookId, currentStatus) => {
    const action = currentStatus === "available" ? "mark as unavailable" : "mark as available";
    const confirmed = window.confirm(`Are you sure you want to ${action} this book?`);
    if (!confirmed) return;

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

  const handleDeleteBook = async (bookId, title) => {
    const confirmed = window.confirm(`Permanently delete "${title}"? This cannot be undone.`);
    if (!confirmed) return;
 
    setIsActing(true);

    try {
      await deleteBook(bookId);
      setBooks((prev) => prev.filter((book) => book._id !== bookId));
      alert("Book deleted.");
    } catch (error) {
      alert(error.message || "Could not reach server.");
    }finally{
      setIsActing(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="heading-lg">Manage Books</h1>
      <p className="text-muted-sm admin-subtitle">Admin view of listings, ownership, and availability.</p>

      <section className="admin-card">
        <div className="admin-row">
          <div>
            <h2 className="heading-md">Listings</h2>
            <p className="text-muted-xs admin-card-note">{isLoading ? "Loading books..." :`${filteredRows.length} book(s) shown`}</p>
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
            placeholder="Search by title, owner or borrower..."
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
                  <td><span className={`admin-pill ${book.status === "available" ? "admin-pill-success" : "admin-pill-warning"}`}>
                    {book.status === "available" ? "AVAILABLE" : "NOT AVAILABLE"}
                  </span></td>
                  <td>{book.holder}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className={`admin-button ${book.status === "available" ? "admin-button-warning" : "admin-button-success"}`}
                        disabled={isActing}
                        onClick={() => handleToggleBook(book.id, book.status)}
                      >
                        {book.status === "available"? "Mark Unavailable": "Mark Available"}
                      </button>
                      <button
                        type="button"
                        className="admin-button admin-button-danger"
                        disabled={isActing}
                        onClick={() => handleDeleteBook(book.id, book.title)}
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
    </AdminLayout>
  );
}