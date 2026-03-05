// A container that displays a grid of book cards for the Search Results page.
// Each individual card will be rendered by the CardLayout component

function BookList() {
  // Placeholder data — will be replaced with real data later
  const books = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 },
  ];

  //Display on screen
  return (
    <section style={styles.section}>
      <h2 style={styles.heading}>Search Results</h2>
      <div style={styles.grid}>
        {books.map((book) => (
            /*for later -> <CardLayout key={book.id} />*/
          <div key={book.id} style={styles.placeholder}>Card {book.id}</div>
        ))}
      </div>
    </section>
  );
}

//Styles for the BookList component
const styles = {
  section: {
    padding: '32px 40px',

  },
  heading: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: '0 0 28px',
    color: 'black',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  placeholder: {
    height: '150px',
    borderRadius: '12px',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999',
    fontSize: '0.9rem',
  },
};

export default BookList;