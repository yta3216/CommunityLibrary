import React, { useCallback, useEffect, useMemo, useState } from "react";
import BookCard from "../components/BookCard/BookCard";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import { getBooks, getPopularBooks } from "../api/books";

const Home = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  // Search state used by Navbar to filter books by title.
  const [searchQuery, setSearchQuery] = useState("");

  const loadBooks = useCallback(async (queryText = "") => {
    try {
      setErrorMessage("");
      setIsLoading(true);

      const data = await getBooks(queryText);

      setBooks(Array.isArray(data) ? data : []);
    } catch (_error) {
      setErrorMessage(
        _error?.message || "Could not reach server. Please try again later.",
      );
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimerId = window.setTimeout(() => {
      loadBooks(searchQuery);
    }, 300);

    return () => {
      window.clearTimeout(debounceTimerId);
    };
  }, [loadBooks, searchQuery]);

  const [popularBooks, setPopularBooks] = useState([]);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const data = await getPopularBooks(searchQuery);
        setPopularBooks((Array.isArray(data) ? data : []).map((item) => ({
            ...item.bookData,
            avgRating: item.avgRating,
          })));
        }
      catch (_error) {
        setPopularBooks([]);
      }
    };
    const debounceTimerId = window.setTimeout(fetchPopular, 300);

    return () => {
      window.clearTimeout(debounceTimerId);
    };
  }, [searchQuery]);

  const newBooks = useMemo(() => books.slice(), [books]);

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
        rating={typeof book.avgRating === "number" ? Math.round(book.avgRating) : 0}
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
            {renderCardRow(popularBooks)}
          </div>

          <h2 style={styles.sectionTitle}>New Additions</h2>
          <div style={styles.cardRow}>{renderCardRow(newBooks)}</div>
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
