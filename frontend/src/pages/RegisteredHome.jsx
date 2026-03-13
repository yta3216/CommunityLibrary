import React from "react";
import BookCard from "../components/BookCard/BookCard";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import { useNavigate } from "react-router-dom";

/*Sample books (will be replaced later after backend is implemented)*/
const popularBooks = [
  { title: 'Book Title', author: 'Author Name', genre: '', rating: 2 },
  { title: 'Book Title', author: 'Author Name', genre: '', rating: 3 },
  { title: 'Book Title', author: 'Author Name', genre: '', rating: 3 },
  { title: 'Book Title', author: 'Author Name', genre: '', rating: 2 },
];

const newBooks = [
  { title: 'Book Title', author: 'Author Name', genre: '', rating: 2 },
  { title: 'Book Title', author: 'Author Name', genre: '', rating: 3 },
  { title: 'Book Title', author: 'Author Name', genre: '', rating: 3 },
  { title: 'Book Title', author: 'Author Name', genre: '', rating: 2 },
];

const RegisteredHome = () => {

    const navigate = useNavigate();

    return (
    <div>
      <Navbar isLoggedIn ={true} />
      <div style={styles.page}>
        <Sidebar isLoggedIn={true} />
        
        <main style={styles.main}>
          {/* Most Popular section */}
          <h2 style={styles.sectionTitle}>Most Popular</h2>
          <div style={styles.cardRow}>
            {popularBooks.map((book, i) => (
              <BookCard key={i} title={book.title} author={book.author} genre={book.genre} rating={book.rating} onClick={() => navigate('/book')} />
            ))}
          </div>

          {/* New Additions section */}
          <h2 style={styles.sectionTitle}>All books</h2>
          <div style={styles.cardRow}>
            {newBooks.map((book, i) => (
              <BookCard key={i} title={book.title} author={book.author} genre={book.genre} rating={book.rating} onClick={() => navigate('/book')} />
            ))}
          </div>
          
        </main>

        {/* Create New Listing button */}
        <button style={styles.fab}>Create New Listing</button>
      </div>
    </div>
  );
};

const styles = {
page: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: '100vh',
    backgroundColor: '#fff',
    marginTop: '0',
  },
  main: {
    flex: 1,
    padding: '32px 40px',
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: '0 0 24px',
    color: '#000',
  },
  cardRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: '20px',
    marginBottom: '48px',
    flexWrap: 'nowrap',
  },
  fab: {
    position: 'fixed',
    bottom: '32px',
    right: '32px',
    backgroundColor: '#3d4a5c',
    color: '#fff',
    border: 'none',
    borderRadius: '24px',
    padding: '14px 22px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
};

export default RegisteredHome;