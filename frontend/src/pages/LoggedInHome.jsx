import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard/BookCard";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import {
  isListingAvailable,
  toAvailableCopiesText,
} from "../utils/bookAvailability";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5050";

const LoggedInHome = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  // search state used by Navibar to filter the lists shown below
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createErrorMessage, setCreateErrorMessage] = useState("");
  const [createSuccessMessage, setCreateSuccessMessage] = useState("");
  const [formValues, setFormValues] = useState({
    isbn: "",
    title: "",
    author: "",
    genre: "",
    description: "",
  });

  const loadBooks = useCallback(async () => {
    try {
      setErrorMessage("");
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/books`);
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Failed to load books.");
        setBooks([]);
        return;
      }

      setBooks(Array.isArray(data) ? data : []);
    } catch (_error) {
      setErrorMessage("Could not reach server. Please try again later.");
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    loadBooks();
  }, [loadBooks, navigate]);

  const booksGroupedByIsbn = useMemo(() => {
    const grouped = new Map();

    books.forEach((book) => {
      const isbnKey =
        String(book?.isbn || "").trim() || String(book?._id || "");
      const isAvailable = isListingAvailable(book);

      if (!grouped.has(isbnKey)) {
        grouped.set(isbnKey, {
          representative: book,
          availableCount: isAvailable ? 1 : 0,
          representativeAvailable: isAvailable,
        });
        return;
      }

      const existing = grouped.get(isbnKey);
      existing.availableCount += isAvailable ? 1 : 0;

      if (!existing.representativeAvailable && isAvailable) {
        existing.representative = book;
        existing.representativeAvailable = true;
      }
    });

    return Array.from(grouped.values()).map((entry) => ({
      ...entry.representative,
      availableCountByIsbn: entry.availableCount,
    }));
  }, [books]);

  // Placeholder ordering until review counts are implemented.
  // Popular books
  const [popularBooks, setPopularBooks] = useState([]);
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/books/popular`);
        const data = await response.json();
        if (response.ok) {
          setPopularBooks(
            data.map((item) => ({
              ...item.bookData,
              avgRating: item.avgRating,
              numberOfReviews: item.numberOfReviews,
            })),
          );
        }
      } catch (_error) {
        // silent failure
      }
    };
    fetchPopular();
  }, []);

  const allAvailableBooks = useMemo(
    () => books.filter((book) => isListingAvailable(book)),
    [books],
  );

  // One shared filter that matches book titles against the current search term.
  const filterBooksByTitle = useCallback(
    (bookList) => {
      const normalizedQuery = searchQuery.trim().toLowerCase();
      if (!normalizedQuery) {
        return bookList;
      }

      return bookList.filter((book) =>
        String(book.title || "")
          .toLowerCase()
          .includes(normalizedQuery),
      );
    },
    [searchQuery],
  );

  // Filter each section so typing in Navbar updates both rows immediately.
  const filteredPopularBooks = useMemo(
    () => filterBooksByTitle(popularBooks),
    [filterBooksByTitle, popularBooks],
  );
  const filteredAllBooks = useMemo(
    () => filterBooksByTitle(allAvailableBooks),
    [allAvailableBooks, filterBooksByTitle],
  );

  const renderCardRow = (bookList) => {
    if (isLoading) {
      return <p style={styles.metaText}>Loading books...</p>;
    }

    if (errorMessage) {
      return <p style={styles.errorText}>{errorMessage}</p>;
    }

    if (bookList.length === 0) {
      return <p style={styles.metaText}>No books found.</p>;
    }

    return bookList.map((book) => (
      <BookCard
        key={book._id}
        title={book.title || "Untitled"}
        author={book.author || "Unknown author"}
        genre={book.genre || "Unknown"}
        availabilityLabel={toAvailableCopiesText(
          book.availableCountByIsbn || 0,
        )}
        rating={
          typeof book.avgRating === "number" ? Math.round(book.avgRating) : 0
        }
        onClick={() => navigate(`/book?id=${book._id}`)}
      />
    ));
  };

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    setCreateErrorMessage("");
    setCreateSuccessMessage("");

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
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        isbn,
        title,
        author,
        genre,
        description,
      };

      const response = await fetch(`${API_BASE_URL}/api/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setCreateErrorMessage(result.message || "Failed to create book.");
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
      setCreateSuccessMessage("Book posted successfully.");
      setIsCreateOpen(false);
    } catch (_error) {
      setCreateErrorMessage("Could not reach server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar
        isLoggedIn={true}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div style={styles.page}>
        <Sidebar isLoggedIn={true} />

        <main style={styles.main}>
          <h2 style={styles.sectionTitle}>Most Popular</h2>
          <div style={styles.cardRow}>
            {renderCardRow(filteredPopularBooks)}
          </div>

          <h2 style={styles.sectionTitle}>All Books</h2>
          <div style={styles.cardRow}>{renderCardRow(filteredAllBooks)}</div>
        </main>

        <button
          style={styles.fab}
          onClick={() => {
            setIsCreateOpen(true);
            setCreateErrorMessage("");
            setCreateSuccessMessage("");
          }}
        >
          Create New Listing
        </button>

        {isCreateOpen ? (
          <div style={styles.modalBackdrop}>
            <div style={styles.modalCard}>
              <h3 style={styles.modalTitle}>Create New Book Listing</h3>

              <form onSubmit={handleCreateSubmit} style={styles.formGrid}>
                <label style={styles.inputLabel} htmlFor="book-isbn">
                  ISBN
                </label>
                <input
                  id="book-isbn"
                  name="isbn"
                  required
                  value={formValues.isbn}
                  onChange={handleCreateChange}
                  style={styles.textInput}
                  placeholder="ISBN here"
                />

                <label style={styles.inputLabel} htmlFor="book-title">
                  Title
                </label>
                <input
                  id="book-title"
                  name="title"
                  required
                  value={formValues.title}
                  onChange={handleCreateChange}
                  style={styles.textInput}
                  placeholder="Book title here"
                />

                <label style={styles.inputLabel} htmlFor="book-author">
                  Author
                </label>
                <input
                  id="book-author"
                  name="author"
                  required
                  value={formValues.author}
                  onChange={handleCreateChange}
                  style={styles.textInput}
                  placeholder="Author name here"
                />

                <label style={styles.inputLabel} htmlFor="book-genre">
                  Genre
                </label>
                <input
                  id="book-genre"
                  name="genre"
                  required
                  value={formValues.genre}
                  onChange={handleCreateChange}
                  style={styles.textInput}
                  placeholder="Genre here"
                />

                <label style={styles.inputLabel} htmlFor="book-description">
                  Description
                </label>
                <textarea
                  id="book-description"
                  name="description"
                  required
                  value={formValues.description}
                  onChange={handleCreateChange}
                  style={styles.textArea}
                  placeholder="Write a short description"
                />

                {createErrorMessage ? (
                  <p style={styles.createErrorText}>{createErrorMessage}</p>
                ) : null}

                {createSuccessMessage ? (
                  <p style={styles.createSuccessText}>{createSuccessMessage}</p>
                ) : null}

                <div style={styles.modalButtonRow}>
                  <button
                    type="submit"
                    style={styles.primaryButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Posting..." : "Post Book"}
                  </button>

                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    flexDirection: "row",
    minHeight: "100vh",
    backgroundColor: "#fff",
    marginTop: "0",
  },
  main: {
    flex: 1,
    padding: "32px 40px",
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    margin: "0 0 24px",
    color: "#000",
  },
  cardRow: {
    display: "flex",
    flexDirection: "row",
    gap: "20px",
    marginBottom: "48px",
    flexWrap: "wrap",
  },
  metaText: {
    color: "#667085",
    fontSize: "18px",
    margin: 0,
  },
  errorText: {
    color: "#b42318",
    fontSize: "18px",
    margin: 0,
  },
  fab: {
    position: "fixed",
    bottom: "32px",
    right: "32px",
    backgroundColor: "#3d4a5c",
    color: "#fff",
    border: "none",
    borderRadius: "24px",
    padding: "14px 22px",
    fontSize: "0.9rem",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
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
    maxWidth: "640px",
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
  inputLabel: {
    fontSize: "14px",
    color: "#344054",
    fontWeight: 600,
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
  createErrorText: {
    margin: 0,
    color: "#b42318",
    fontSize: "14px",
    fontWeight: 600,
  },
  createSuccessText: {
    margin: 0,
    color: "#166534",
    fontSize: "14px",
    fontWeight: 600,
  },
  modalButtonRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },
  primaryButton: {
    border: "none",
    borderRadius: "8px",
    padding: "10px 14px",
    fontWeight: 700,
    color: "#fff",
    backgroundColor: "#3d4a5c",
    cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid #d0d5dd",
    borderRadius: "8px",
    padding: "10px 14px",
    fontWeight: 700,
    color: "#344054",
    backgroundColor: "#fff",
    cursor: "pointer",
  },
};

export default LoggedInHome;
