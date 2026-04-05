import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard/BookCard";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import BookForm from "../components/BookForm";
import useBooks from "../hooks/useBooks";
import "./LoggedInHome.css";

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
    if (isLoading) return <p className="text-muted-sm">Loading books...</p>;
    if (errorMessage) return <p className="text-error">{errorMessage}</p>;
    if (bookList.length === 0) return <p className="text-muted-sm">No books found.</p>;

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
      <div className="page-shell logged-in-home sidebar-layout">
        <Sidebar isLoggedIn={true} />
        <main className="page-content content">
          <h2 className="heading-lg">Most Popular</h2>
          <div className="card-row">{renderCardRow(popularBooks)}</div>

          <h2 className="heading-lg">All Books</h2>
          <div className="card-row">{renderCardRow(availableBooks)}</div>
        </main>

        <button className="logged-in-home-fab" onClick={() => setIsCreateOpen(true)}>
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

export default LoggedInHome;