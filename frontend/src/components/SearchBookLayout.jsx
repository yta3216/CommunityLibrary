// A container that displays a grid of book cards for the Search Results page.
// Each individual card will be rendered by the CardLayout component

import BookCard from "./BookCard/BookCard";
import "./SearchBookLayout.css";

function BookList() {
  // Placeholder data — will be replaced with real data later
  const books = [
    { id: 1, title: 'Book Title', genre: '', rating: 0 },
    { id: 2, title: 'Book Title', genre: '', rating: 0 },
    { id: 3, title: 'Book Title', genre: '', rating: 0 },
    { id: 4, title: 'Book Title', genre: '', rating: 0 },
    { id: 5, title: 'Book Title', genre: '', rating: 0 },
    { id: 6, title: 'Book Title', genre: '', rating: 0 },
    { id: 7, title: 'Book Title', genre: '', rating: 0 },
    { id: 8, title: 'Book Title', genre: '', rating: 0 },
    { id: 9, title: 'Book Title', genre: '', rating: 0 },
  ];

  //Display on screen
  return (
    <section className="search-results-section">
      <h2 className="heading-md">Search Results</h2>
      <div className="search-results-grid">
        {books.map((book) => (
          <BookCard
            key={book.id}
            title={book.title}
            genre={book.genre}
            rating={book.rating}
          />
        ))}
      </div>
    </section>
  );
}

export default BookList;