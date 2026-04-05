import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard/BookCard";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import BookForm from "../components/BookForm";
import useBooks from "../hooks/useBooks";

const LoggedInHome = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { availableBooks, popularBooks, isLoading, errorMessage, createBook } = useBooks(searchQuery, { fetchPopular: true });

  const handleCreateBook = async (values) => {
    await createBook(values);
    setIsCreateOpen(false);
  };

  const renderCardRow = (bookList) => {
    if (isLoading) return <p style={styles.metaText}>Loading books...</p>;
    if (errorMessage) return <p className="text-error">{errorMessage}</p>;
    if (bookList.length === 0) return <p style={styles.metaText}>No books found.</p>;

    return bookList.map((book) => (
      <BookCard
        key={book._id}
        title={book.title || "Untitled"}
        author={book.author || "Unknown author"}
        owner={book.owner?.username || "Unknown"}
        genre={book.genre || "Unknown"}
        rating={typeof book.avgRating === "number" ? Math.round(book.avgRating) : 0}
        onClick={() => navigate(`/book?id=${book._id}`)}
      />
    ));
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
          <div style={styles.cardRow}>{renderCardRow(popularBooks)}</div>

          <h2 style={styles.sectionTitle}>All Books</h2>
          <div style={styles.cardRow}>{renderCardRow(availableBooks)}</div>
        </main>

        <button style={styles.fab} onClick={() => setIsCreateOpen(true)}>
          Create New Listing
        </button>

        {isCreateOpen ? (
          <BookForm
            onSubmit={handleCreateBook}
            onCancel={() => setIsCreateOpen(false)}
            modalTitle="Create New Book Listing"
          />
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
    marginTop: "0"
  },
  main: {
    flex: 1,
    padding: "32px 40px",
    minWidth: 0
  },
  sectionTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    margin: "0 0 24px",
    color: "#000"
  },
  cardRow: {
    display: "flex",
    flexDirection: "row",
    gap: "20px",
    marginBottom: "48px",
    flexWrap: "wrap"
  },
  metaText: {
    color: "#667085",
    fontSize: "18px",
    margin: 0
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
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
  },
};

export default LoggedInHome;