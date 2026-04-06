import { useEffect, useState } from "react";
import { getReviewsByUser } from "../../api/reviews";
import "./AdminPages.css";

export default function UserDetailPanel({ user, ownedBooks, borrowedBooks, onDeleteBook, onDeleteReview }) {
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [activeTab, setActiveTab] = useState("listed");

  useEffect(() => {
    let isMounted = true;
    setIsLoadingReviews(true);

    getReviewsByUser(user.id)
      .then((data) => {
        if (isMounted) setReviews(Array.isArray(data) ? data : []);
      })
      .catch((_err) => {
        if (isMounted) setReviews([]);
        console.error("getReviewsByUser failed:", _err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingReviews(false);
      });

    return () => { isMounted = false; };
  }, [user.id]);

  const tabs = [
    { key: "listed", label: `Listed Books (${ownedBooks.length})` },
    { key: "borrowed", label: `Borrowed (${borrowedBooks.length})` },
    { key: "reviews", label: `Reviews (${isLoadingReviews ? "..." : reviews.length})` },
  ];

  return (
    <div className="user-detail-panel">
      <div className="user-detail-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`user-detail-tab${activeTab === tab.key ? " active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="user-detail-content">
        {activeTab === "listed" && (
          ownedBooks.length === 0 ? (
            <p className="text-muted-xs admin-card-note">No listed books.</p>
          ) : (
            <table className="admin-table user-detail-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Genre</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {ownedBooks.map((book) => (
                  <tr key={book._id}>
                    <td><strong>{book.title || "Untitled"}</strong></td>
                    <td>{book.genre || "—"}</td>
                    <td>
                      <span className="admin-pill">
                        {String(book.status || "").toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-button admin-button-danger"
                        onClick={() => onDeleteBook(book._id, book.title)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {activeTab === "borrowed" && (
          borrowedBooks.length === 0 ? (
            <p className="text-muted-xs admin-card-note">Not currently borrowing any books.</p>
          ) : (
            <table className="admin-table user-detail-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Genre</th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                {borrowedBooks.map((book) => {
                  const ownerName =
                    typeof book.owner === "object" ? book.owner?.username : "Unknown";
                  return (
                    <tr key={book._id}>
                      <td><strong>{book.title || "Untitled"}</strong></td>
                      <td>{book.genre || "—"}</td>
                      <td>{ownerName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}

        {activeTab === "reviews" && (
          isLoadingReviews ? (
            <p className="text-muted-xs admin-card-note">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-muted-xs admin-card-note">No reviews written.</p>
          ) : (
            <table className="admin-table user-detail-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Book Owner</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review._id}>
                    <td><strong>{review.book?.title || "Unknown book"}</strong></td>
                    <td>{review.book?.owner?.username || "—"}</td>
                    <td>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</td>
                    <td className="user-detail-comment">{review.comment || "—"}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-button admin-button-danger"
                        onClick={() => {
                          onDeleteReview(review._id);
                          setReviews((prev) => prev.filter((r) => r._id !== review._id));
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}