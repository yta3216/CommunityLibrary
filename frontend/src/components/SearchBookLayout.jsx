// A container that displays a grid of book cards for the Search Results page.
// Each individual card will be rendered by the CardLayout component

import BookCard from "./BookCard/BookCard";

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
    <section style={styles.section}>
      <h2 style={styles.heading}>Search Results</h2>
      <div style={styles.grid}>
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

//Styles for the BookList component
const styles = {
  section: {
    padding: '32px 0',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: '0 0 28px',
    color: '#000',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
};

export default BookList;