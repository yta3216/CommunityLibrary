// Displays a row of similar book cards below the book details.

import BookCard from "../BookCard/BookCard";

function SimilarBooks({ books }) {
  const bookList = books || [
    { title: 'Book Title', genre: 'Horror', rating: 4 },
    { title: 'Book Title', genre: 'Romance', rating: 2 },
    { title: 'Book Title', genre: 'Thriller', rating: 5 },
  ];

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.title}>Similar Books</h3>
      <div style={styles.row}>
        {bookList.map((book, i) => (
          <BookCard
            key={i}
            title={book.title}
            genre={book.genre}
            rating={book.rating}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '700',
    margin: '0 0 16px',
    color: '#000',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    gap: '16px',
  },
};

export default SimilarBooks;