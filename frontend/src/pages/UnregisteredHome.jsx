import React, { useCallback, useEffect, useMemo, useState } from "react";
import BookCard from "../components/BookCard/BookCard";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5050";

const Home = () => {
  const [books, setBooks] = useState([]);
  // Search term from the navbar input.
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
      const response = await fetch(`${API_BASE_URL}/api/books`);
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Failed to load books.");
        return;
      }

      setBooks(Array.isArray(data) ? data : []);
    } catch (_error) {
      setErrorMessage("Could not reach server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // Filter against already-loaded books I don think we need to ass another API just for this.
  // Keep it simple: match by title, author, or genre
  const filteredBooks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return books; // if falsy just return the whole list without filtering to avoid unnecessary processing
    }

    return books.filter((book) => {
      const title = String(book.title || "").toLowerCase(); //if any of those contains normalizedQuery using includes...if at least one matches, that book is kept
      const author = String(book.author || "").toLowerCase();
      const genre = String(book.genre || "").toLowerCase();
      return (
        title.includes(normalizedQuery) ||
        author.includes(normalizedQuery) ||
        genre.includes(normalizedQuery)
      );
    });
  }, [books, searchQuery]);

  // Build the two home sections from filtered results.
  const popularBooks = useMemo(
    () => filteredBooks.slice(0, 6),
    [filteredBooks],
  );
  const newBooks = useMemo(() => filteredBooks.slice(4, 8), [filteredBooks]);

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
        genre={book.genre || "Unknown"}
        rating={typeof book.rating === "number" ? book.rating : 0}
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

    if (!formValues.isbn || !formValues.title || !formValues.genre) {
      setCreateErrorMessage("isbn, title, genre are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        isbn: formValues.isbn.trim(),
        title: formValues.title.trim(),
        author: formValues.author.trim(),
        genre: formValues.genre.trim(),
        description: formValues.description.trim(),
      };

      const response = await fetch(`${API_BASE_URL}/api/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
    } catch (_error) {
      setCreateErrorMessage("Could not reach server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar
        isLoggedIn={false}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div style={styles.page}>
        <Sidebar />

        <main style={styles.main}>
          <h2 style={styles.sectionTitle}>Most Popular</h2>
          <div style={styles.cardRow}>{renderCardRow(popularBooks)}</div>

          <h2 style={styles.sectionTitle}>New Additions</h2>
          <div style={styles.cardRow}>{renderCardRow(newBooks)}</div>
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
                  value={formValues.description}
                  onChange={handleCreateChange}
                  style={styles.textArea}
                  placeholder="base registration test"
                />

                <p style={styles.payloadPreviewTitle}>Payload Preview</p>
                <pre style={styles.payloadPreview}>
                  {JSON.stringify(
                    {
                      isbn: formValues.isbn,
                      title: formValues.title,
                      author: formValues.author,
                      genre: formValues.genre,
                      description: formValues.description,
                    },
                    null,
                    2,
                  )}
                </pre>

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
  payloadPreviewTitle: {
    margin: "8px 0 0",
    fontSize: "13px",
    color: "#667085",
    fontWeight: 700,
  },
  payloadPreview: {
    margin: 0,
    padding: "10px",
    borderRadius: "8px",
    backgroundColor: "#f2f4f7",
    fontSize: "12px",
    overflowX: "auto",
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

export default Home;
