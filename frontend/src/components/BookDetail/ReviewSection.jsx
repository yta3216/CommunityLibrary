/*Text input review and comments section of book page*/
import { useState } from "react";

function ReviewSection({ reviews, currentUser, postedBy }) {
  const [reviewText, setReviewText] = useState('');

  const existingReviews = reviews || [
    { text: 'Some review', user: 'Some User', year: '2024' },
    { text: 'Some other review', user: 'Some other user', year: '2024' },
  ];

  // Check if the current user is the one who posted the book
  const isOwner = currentUser === postedBy;

  function handleSubmit() {
    // Will connect to backend later
    setReviewText('');
  }

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.title}>Reviews</h3>

      {/* Only show review form if the user is not the owner of the listing */}
      {isOwner ? (
        <p style={styles.ownerMessage}>You cannot review your own listing.</p>
      ) : (
        <>
          <textarea
            placeholder="Write a review"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            style={styles.textarea}
          />
          <div style={styles.buttonRow}>
            <button onClick={handleSubmit} style={styles.submitButton}>
              Leave a review
            </button>
            <button onClick={() => setReviewText('')} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </>
      )}

      {/* Existing reviews — always visible */}
      <div style={styles.reviewList}>
        {existingReviews.map((review, i) => (
          <div key={i} style={styles.reviewItem}>
            <div style={styles.reviewLeft}>
              <p style={styles.reviewText}>{review.text}</p>
              <p style={styles.reviewUser}>By: {review.user}</p>
            </div>
            <span style={styles.reviewYear}>{review.year}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    marginBottom: '40px',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '700',
    margin: '0 0 16px',
    color: '#000',
  },
  textarea: {
    width: '100%',
    height: '120px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '0.9rem',
    resize: 'none',
    outline: 'none',
    boxSizing: 'border-box',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    margin: '12px 0 24px',
  },
  submitButton: {
    backgroundColor: '#4f7f7c',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 20px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    color: '#333',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 20px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  reviewList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  reviewItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: '12px',
  },
  reviewLeft: {},
  reviewText: {
    margin: '0 0 4px',
    fontSize: '0.9rem',
    color: '#000',
  },
  reviewUser: {
    margin: 0,
    fontSize: '0.8rem',
    color: '#666',
  },
  reviewYear: {
    fontSize: '0.85rem',
    color: '#666',
    flexShrink: 0,
  },
};
export default ReviewSection;