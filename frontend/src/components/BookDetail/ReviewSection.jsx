import { useState, useEffect, useCallback } from "react";
import { createReview, getReviews } from "../../api/reviews";

// Star rating input — lets user click to select 1-5 stars
function StarInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{
            fontSize: "1.8rem",
            cursor: "pointer",
            color: star <= (hovered || value) ? "#FFD700" : "#ccc",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// Display-only stars used inside each review card
function StarDisplay({ value }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            fontSize: "1rem",
            color: star <= Math.round(value) ? "#FFD700" : "#ccc",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ReviewSection({ bookId, currentUser, postedBy }) {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // currentUser and postedBy are MongoDB _id strings
  // if they match, this user owns the listing and cannot review it
  const isOwner = currentUser && postedBy && currentUser === postedBy;

  // Load all reviews for this book from the backend
  const loadReviews = useCallback(async () => {
    if (!bookId) return;

    try {
      setIsLoading(true);
      const data = await getReviews(bookId);
      setReviews(data.reviews || []);
      setAvgRating(data.avgRating || 0);
    } catch (_error) {
      // silently fail — reviews are not critical to page load
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  async function handleSubmit() {
    setErrorMessage("");
    setSuccessMessage("");

    // Validate before sending
    if (rating === 0) {
      setErrorMessage("Please select a star rating.");
      return;
    }
    if (!reviewText.trim()) {
      setErrorMessage("Please write a comment.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createReview({
        bookId,
        rating,
        comment: reviewText.trim(),
      });

      // Reset form and reload reviews to show the new one
      setReviewText("");
      setRating(0);
      setSuccessMessage("Review submitted!");
      loadReviews();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (_error) {
      setErrorMessage(_error?.message || "Could not reach server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Format a date string like "March 2025"
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.titleRow}>
        <h3 style={styles.title}>Reviews</h3>
        {/* Show average rating if there are any reviews */}
        {reviews.length > 0 && (
          <div style={styles.avgRow}>
            <StarDisplay value={avgRating} />
            <span style={styles.avgText}>
              {avgRating} / 5 ({reviews.length}{" "}
              {reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}
      </div>

      {/* Review form — hidden if user owns the listing */}
      {isOwner ? (
        <p style={styles.ownerMessage}>
          You cannot review your own listing.
        </p>
      ) : (
        <>
          <StarInput value={rating} onChange={setRating} />
          <textarea
            placeholder="Write a review..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            style={styles.textarea}
            disabled={isSubmitting}
          />
          {errorMessage && (
            <p style={styles.errorText}>{errorMessage}</p>
          )}
          {successMessage && (
            <p style={styles.successText}>{successMessage}</p>
          )}
          <div style={styles.buttonRow}>
            <button
              onClick={handleSubmit}
              style={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Leave a review"}
            </button>
            <button
              onClick={() => {
                setReviewText("");
                setRating(0);
                setErrorMessage("");
              }}
              style={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {/* Reviews list */}
      <div style={styles.reviewList}>
        {isLoading ? (
          <p style={styles.metaText}>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p style={styles.metaText}>
            No reviews yet. Be the first to review!
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} style={styles.reviewItem}>
              <div style={styles.reviewTop}>
                <span style={styles.reviewUser}>
                  {review.reviewer?.username || "Anonymous"}
                </span>
                <span style={styles.reviewDate}>
                  {formatDate(review.createdAt)}
                </span>
              </div>
              <StarDisplay value={review.rating} />
              <p style={styles.reviewText}>{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: { marginBottom: "40px" },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  title: {
    fontSize: "1.2rem",
    fontWeight: "700",
    margin: 0,
    color: "#000",
  },
  avgRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  avgText: {
    fontSize: "0.9rem",
    color: "#555",
  },
  ownerMessage: {
    color: "#888",
    fontSize: "0.9rem",
    marginBottom: "16px",
  },
  textarea: {
    width: "100%",
    height: "120px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "0.9rem",
    resize: "none",
    outline: "none",
    boxSizing: "border-box",
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    margin: "12px 0 24px",
  },
  submitButton: {
    backgroundColor: "#4f7f7c",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    padding: "8px 20px",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  cancelButton: {
    backgroundColor: "#e0e0e0",
    color: "#333",
    border: "none",
    borderRadius: "20px",
    padding: "8px 20px",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  errorText: {
    color: "#b42318",
    fontSize: "0.85rem",
    margin: "4px 0",
  },
  successText: {
    color: "#166534",
    fontSize: "0.85rem",
    margin: "4px 0",
  },
  reviewList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  reviewItem: {
    borderBottom: "1px solid #f0f0f0",
    paddingBottom: "16px",
  },
  reviewTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "4px",
  },
  reviewUser: {
    fontWeight: "600",
    fontSize: "0.9rem",
    color: "#333",
  },
  reviewDate: {
    fontSize: "0.8rem",
    color: "#888",
  },
  reviewText: {
    margin: "6px 0 0",
    fontSize: "0.9rem",
    color: "#444",
  },
  metaText: {
    color: "#888",
    fontSize: "0.9rem",
  },
};

export default ReviewSection;