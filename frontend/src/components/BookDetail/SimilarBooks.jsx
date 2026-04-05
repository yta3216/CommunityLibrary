// removed from book page due to complicated implementation might be revisited in the future.
// Displays a row of similar book cards below the book details.

import BookCard from "../BookCard/BookCard";
import "./SimilarBooks.css";

function SimilarBooks({ books, onSelectBook }) {
  const bookList = books || [
    { id: "book-1", title: "Book Title", genre: "Horror", rating: 4 },
    { id: "book-2", title: "Book Title", genre: "Romance", rating: 2 },
    { id: "book-3", title: "Book Title", genre: "Thriller", rating: 5 },
  ];

  return (
    <div className="similar-books-wrapper">
      <h3 className="heading-md">Similar Books</h3>
      <div className="similar-books-row">
        {bookList.map((book, i) => (
          <BookCard
            key={book.id || i}
            title={book.title}
            author={book.author || "Unknown author"}
            genre={book.genre}
            rating={book.rating}
            onClick={book.id ? () => onSelectBook?.(book.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "1.2rem",
    fontWeight: "700",
    margin: "0 0 16px",
    color: "#000",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    gap: "16px",
  },
};

export default SimilarBooks;
