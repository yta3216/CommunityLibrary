import { useState, useEffect, useCallback } from "react";
import { createReview, getReviews } from "../../api/reviews";
import { useSSE } from "../../hooks/useSSE";
import "./ReviewSection.css";

// Star rating input — lets user click to select 1-5 stars
function StarInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="review-stars-input">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={`review-star-input${star <= (hovered || value) ? " review-star-input--active" : ""}`}
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
    <div className="review-stars-display">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`review-star-display${star <= Math.round(value) ? " review-star-display--active" : ""}`}
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
  const [avgReviews, setAvgReviews] = useState(0);
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
      setAvgReviews(data.avgReviews || 0);
    } catch (_error) {
      // silently fail — reviews are not critical to page load
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useSSE(bookId ? [`book:${bookId}`] : [], {
    "review:created": ({ review, avgReviews: next, numberOfReviews }) => {
      setReviews((prev) => {
        const alreadyPresent = prev.some((r) => String(r._id) === String(review._id));
        return alreadyPresent ? prev : [review, ...prev];
      });
      setAvgReviews(next);
    },
    "review:deleted": ({ reviewId, avgReviews: next }) => {
      setReviews((prev) => prev.filter((r) => String(r._id) !== String(reviewId)));
      setAvgReviews(next);
    },
  });

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
    <div className="review-section">
      <div className="review-section-title-row">
        <label className="book-label">Reviews</label>
        {/* Show average rating if there are any reviews */}
        {reviews.length > 0 && (
          <div className="review-section-avg-row">
            <StarDisplay value={avgReviews} />
            <span className="text-muted-xs review-section-avg-text">
              {avgReviews} / 5 ({reviews.length}{" "}
              {reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}
      </div>

      {/* Review form — hidden if user owns the listing */}
      {isOwner ? (
        <p className="text-muted-xs review-section-owner-message">
          You cannot review your own listing.
        </p>
      ) : (
        <>
          <StarInput value={rating} onChange={setRating} />
          <textarea
            placeholder="Write a review..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="review-section-textarea"
            disabled={isSubmitting}
          />
          {errorMessage && (
            <p className="review-section-error">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="review-section-success">{successMessage}</p>
          )}
          <div className="review-section-button-row">
            <button
              onClick={handleSubmit}
              className="review-section-button review-section-button--primary"
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
              className="review-section-button review-section-button--secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {/* Reviews list */}
      <div className="review-section-list">
        {isLoading ? (
          <p className="text-muted-sm">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-muted-sm">
            No reviews yet. Be the first to review!
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="review-section-item">
              <div className="review-section-item-top">
                <span className="review-section-user">
                  {review.reviewer?.username || "Deleted User"}
                </span>
                <span className="review-section-date">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              <StarDisplay value={review.rating} />
              <p className="review-section-text">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ReviewSection;