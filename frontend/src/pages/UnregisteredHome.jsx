import React, { useCallback, useEffect, useMemo, useState } from "react";
import BookCard from "../components/BookCard/BookCard";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5050";

const Home = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  // Search state used by Navbar to filter books by title.
  const [searchQuery, setSearchQuery] = useState("");

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
    loadBooks();
  }, [loadBooks]);

  const popularBooks = useMemo(() => books.slice(0, 5), [books]);
  const newBooks = useMemo(() => books.slice(), [books]);

  // Reusable title-based filter so both sections respond to the same search term.
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

  // Filtered datasets used by UI rendering.
  const filteredPopularBooks = useMemo(
    () => filterBooksByTitle(popularBooks),
    [filterBooksByTitle, popularBooks],
  );
  const filteredNewBooks = useMemo(
    () => filterBooksByTitle(newBooks),
    [filterBooksByTitle, newBooks],
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
        rating={typeof book.rating === "number" ? book.rating : 0}
      />
    ));
  };

  return (
    <div>
      <Navbar
        isLoggedIn={false}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div style={styles.page}>
        <Sidebar isLoggedIn={false} />

        <main style={styles.main}>
          <h2 style={styles.sectionTitle}>Most Popular</h2>
          <div style={styles.cardRow}>
            {renderCardRow(filteredPopularBooks)}
          </div>

          <h2 style={styles.sectionTitle}>New Additions</h2>
          <div style={styles.cardRow}>{renderCardRow(filteredNewBooks)}</div>
          <p style={styles.metaText}>
            To open book details or create listings, please log in or register.
          </p>
        </main>
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
};

export default Home;
