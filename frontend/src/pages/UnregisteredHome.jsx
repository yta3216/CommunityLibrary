import React, { useCallback, useEffect, useMemo, useState } from "react";
import BookCard from "../components/BookCard/BookCard";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import { getBooks, getPopularBooks } from "../api/books";
import "./UnregisteredHome.css";

const Home = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
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
        setPopularBooks(
          (Array.isArray(data) ? data : []).map((item) => ({
            ...item.bookData,
            avgRating: item.avgRating,
          })),
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

  const newBooks = useMemo(() => books.slice(), [books]);

  const renderCardRow = (bookList) => {
    if (isLoading) {
      return <p className="text-muted-sm">Loading books...</p>;
    }

    if (errorMessage) {
      return <p className="text-error">{errorMessage}</p>;
    }

    if (bookList.length === 0) {
      return <p className="text-muted-sm">No books found.</p>;
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
      <div className="page-shell unregistered-home">
        <Sidebar isLoggedIn={false} />
        <main className="page-content">
          <h2 className="heading-md">Most Popular</h2>
          <div className="card-row">{renderCardRow(popularBooks)}</div>

          <h2 className="heading-md">New Additions</h2>
          <div className="card-row">{renderCardRow(newBooks)}</div>
          <p className="text-muted-sm unregistered-home-note">
            To open book details or create listings, please log in or register.
          </p>
        </main>
      </div>
    </div>
  );
};

export default Home;
