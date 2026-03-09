// The full book detail page.

import Navbar from "../components/Navbar/Navbar";
import BookCover from "../components/BookDetail/BookCover";
import BookActions from "../components/BookDetail/BookTags";
import SimilarBooks from "../components/BookDetail/SimilarBooks";

function BookDetail() {
  return (
    <div>
      <Navbar isLoggedIn={true}/>

      <div style={styles.page}>
        {/* Book title */}
        <h1 style={styles.title}>Book Name</h1>

        {/* Cover image + synopsis */}
        <BookCover />

        {/* Genre tags + action buttons */}
        <BookActions />

        {/* Similar books row */}
        <SimilarBooks />
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: '0 0 24px',
    color: '#000',
  },
};

export default BookDetail;