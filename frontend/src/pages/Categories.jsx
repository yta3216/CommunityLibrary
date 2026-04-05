import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5050";

const extractPrimaryGenre = (genreValue) => {
  const normalized = String(genreValue || "").trim();
  if (!normalized) {
    return "";
  }

  // if multiple genres are ever stored in one field, keep only the first one
  return normalized.split(",")[0].trim();
};

const startsWithLetter = (value) => /^[A-Za-z]/.test(value);

function Categories() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    let isMounted = true;

    const fetchBooks = async () => {
      try {
        setErrorMessage("");
        setIsLoading(true);

        const response = await fetch(`${API_BASE_URL}/api/books`);
        const data = await response.json();

        if (!response.ok) {
          if (isMounted) {
            setBooks([]);
            setErrorMessage(data.message || "Failed to load categories.");
          }
          return;
        }

        if (isMounted) {
          setBooks(Array.isArray(data) ? data : []);
        }
      } catch (_error) {
        if (isMounted) {
          setBooks([]);
          setErrorMessage("Could not reach server. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBooks();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const genresWithBooks = useMemo(() => {
    const grouped = new Map();

    books.forEach((book) => {
      const primaryGenre = extractPrimaryGenre(book?.genre);
      const key = startsWithLetter(primaryGenre) ? primaryGenre : "Other";

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }

      grouped.get(key).push(book);
    });

    return Array.from(grouped.entries())
      .sort(([leftGenre], [rightGenre]) => {
        if (leftGenre === "Other") {
          return 1;
        }
        if (rightGenre === "Other") {
          return -1;
        }
        return leftGenre.localeCompare(rightGenre);
      })
      .map(([genre, genreBooks]) => ({
        genre,
        books: genreBooks.sort((leftBook, rightBook) =>
          String(leftBook?.title || "").localeCompare(
            String(rightBook?.title || ""),
          ),
        ),
      }));
  }, [books]);

  return (
    <div>
      <Navbar
        isLoggedIn={true}
        onSearchClick={() => navigate("/home")}
        onSearchFocus={() => navigate("/home")}
      />

      <div style={styles.page}>
        <Sidebar isLoggedIn={true} />

        <main style={styles.main}>
          <div style={styles.sectionHeadingRow}>
            <span style={styles.sectionAccent} />
            <h2 style={styles.sectionTitle}>Categories</h2>
          </div>

          {isLoading ? (
            <p style={styles.metaText}>Loading categories...</p>
          ) : null}

          {!isLoading && errorMessage ? (
            <p style={styles.errorText}>{errorMessage}</p>
          ) : null}

          {!isLoading && !errorMessage && genresWithBooks.length === 0 ? (
            <p style={styles.metaText}>No categories found.</p>
          ) : null}

          {!isLoading && !errorMessage
            ? genresWithBooks.map((group) => (
                <details key={group.genre} style={styles.genrePanel} open>
                  <summary style={styles.genreSummary}>
                    <span>{group.genre}</span>
                    <span style={styles.genreCount}>{group.books.length}</span>
                  </summary>

                  <ul style={styles.bookList}>
                    {group.books.map((book) => (
                      <li key={book._id} style={styles.bookListItem}>
                        <button
                          type="button"
                          style={styles.bookButton}
                          onClick={() => navigate(`/book?id=${book._id}`)}
                        >
                          <span style={styles.bookTitle}>
                            {book.title || "Untitled"}
                          </span>
                          <span style={styles.bookAuthor}>
                            {book.author || "Unknown author"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </details>
              ))
            : null}
        </main>
      </div>
    </div>
  );
}

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
    margin: 0,
    color: "#000",
  },
  sectionHeadingRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "0 0 24px",
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
  genrePanel: {
    border: "1px solid #b7d6c1",
    borderRadius: "12px",
    marginBottom: "14px",
    backgroundColor: "#f7fbf8",
    overflow: "hidden",
  },
  genreSummary: {
    cursor: "pointer",
    listStyle: "none",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    fontSize: "1rem",
    fontWeight: 700,
    color: "#111827",
    borderBottom: "1px solid #d7e9dd",
    backgroundColor: "#eef7f1",
  },
  genreCount: {
    fontSize: "0.85rem",
    color: "#166534",
    border: "1px solid #9ec5aa",
    borderRadius: "999px",
    padding: "2px 10px",
    lineHeight: 1.4,
    backgroundColor: "#e7f3eb",
  },
  bookList: {
    listStyle: "none",
    margin: 0,
    padding: "8px 10px 10px",
  },
  bookListItem: {
    margin: 0,
  },
  bookButton: {
    width: "100%",
    border: "none",
    background: "#ffffff",
    textAlign: "left",
    cursor: "pointer",
    padding: "10px 8px",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    borderLeft: "3px solid #d6eadc",
  },
  bookTitle: {
    color: "#14532d",
    fontWeight: 600,
  },
  bookAuthor: {
    color: "#667085",
    fontSize: "0.9rem",
  },
};

export default Categories;
