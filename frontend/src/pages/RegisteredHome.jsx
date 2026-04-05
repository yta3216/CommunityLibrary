import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard/BookCard";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import "./RegisteredHome.css";

/*Sample books (will be replaced later after backend is implemented)*/
const popularBooks = [
  { title: "Book Title", author: "Author Name", genre: "", rating: 2 },
  { title: "Book Title", author: "Author Name", genre: "", rating: 3 },
  { title: "Book Title", author: "Author Name", genre: "", rating: 3 },
  { title: "Book Title", author: "Author Name", genre: "", rating: 2 },
];

const newBooks = [
  { title: "Book Title", author: "Author Name", genre: "", rating: 2 },
  { title: "Book Title", author: "Author Name", genre: "", rating: 3 },
  { title: "Book Title", author: "Author Name", genre: "", rating: 3 },
  { title: "Book Title", author: "Author Name", genre: "", rating: 2 },
];

const RegisteredHome = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

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

  const filteredPopularBooks = useMemo(
    () => filterBooksByTitle(popularBooks),
    [filterBooksByTitle],
  );

  const filteredAllBooks = useMemo(
    () => filterBooksByTitle(newBooks),
    [filterBooksByTitle],
  );

  return (
    <div>
      <Navbar
        isLoggedIn={true}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="page-shell registered-home">
        <Sidebar isLoggedIn={true} />

        <main className="page-content">
          <h2 className="heading-md">Most Popular</h2>
          <div className="card-row card-row--compact">
            {filteredPopularBooks.map((book, i) => (
              <BookCard
                key={i}
                title={book.title}
                author={book.author}
                genre={book.genre}
                rating={book.rating}
                onClick={() => navigate("/book")}
              />
            ))}
          </div>

          <h2 className="heading-md">All books</h2>
          <div className="card-row card-row--compact">
            {filteredAllBooks.map((book, i) => (
              <BookCard
                key={i}
                title={book.title}
                author={book.author}
                genre={book.genre}
                rating={book.rating}
                onClick={() => navigate("/book")}
              />
            ))}
          </div>
        </main>

        <button className="registered-home-fab">Create New Listing</button>
      </div>
    </div>
  );
};

export default RegisteredHome;
