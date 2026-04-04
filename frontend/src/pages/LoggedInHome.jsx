import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBook, getPopularBooks } from "../api/books";
import { isListingAvailable } from "../utils/bookAvailability";
import BookCard from "../components/BookCard/BookCard";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import BookForm from "../components/BookForm";
import useBooks from "../hooks/useBooks";

const LoggedInHome = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { books, setBooks, isLoading, errorMessage } = useBooks(searchQuery);

  const [popularBooks, setPopularBooks] = useState([]);
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const data = await getPopularBooks(searchQuery);
        setPopularBooks(
          Array.isArray(data)
            ? data.map((item) => ({
              ...item.bookData,
              avgRating: item.avgRating,
              numberOfReviews: item.numberOfReviews,
            }))
            : [],
        );
      } catch (_error) {
        setPopularBooks([]);
      }
    };
    const debounceTimerId = window.setTimeout(fetchPopular, 300);

    return () => {
      window.clearTimeout(debounceTimerId);
    };
  }, [searchQuery]);

  const allAvailableBooks = useMemo(
    () => books.filter((book) => isListingAvailable(book)),
    [books],
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
        owner={book.owner?.username || "Unknown"}
        genre={book.genre || "Unknown"}
        rating={
          typeof book.avgRating === "number" ? Math.round(book.avgRating) : 0
        }
        onClick={() => navigate(`/book?id=${book._id}`)}
      />
    ));
  };
  const handleCreateBook = async (values) => {
    const result = await createBook(values);
    setBooks((prev) => [result, ...prev]);
    setIsCreateOpen(false);
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
            {renderCardRow(popularBooks)}
          </div>

          <h2 style={styles.sectionTitle}>All Books</h2>
          <div style={styles.cardRow}>{renderCardRow(allAvailableBooks)}</div>
        </main>

        <button
          style={styles.fab}
          onClick={() => {
            setIsCreateOpen(true);
          }}
        >
          Create New Listing
        </button>

        {isCreateOpen ? (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3 className="modal-title">Create New Book Listing</h3>
              <BookForm
                onSubmit={handleCreateBook}
                onCancel={() => setIsCreateOpen(false)}
                submitLabel="Post Book"
              />
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
};

export default LoggedInHome;
