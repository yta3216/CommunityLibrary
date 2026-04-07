import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import BookForm from "../../components/BookForm";
import AvgRatingChart from "../../components/charts/AvgRatingChart";
import StatusBreakdownChart from "../../components/charts/StatusBreakdownChart";
import { getMyBooks } from "../../api/users";
import { deleteBook, updateBook, setBookAvailability } from "../../api/books";
import { getChats } from "../../api/chats";
import { apiRequest } from "../../api/client";
import "../admin/AdminPages.css";
import "./Library.css"

function getMyReviews() {
  return apiRequest("/api/reviews/mine");
}

const TABS = ["Listed Books", "Borrowed Books", "My Reviews"];

export default function Library() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Listed Books");
  const [ownedBooks, setOwnedBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [allChats, setAllChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingBook, setEditingBook] = useState(null);
  const [isActing, setIsActing] = useState(false);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [booksData, reviewsData, chatsData] = await Promise.all([
        getMyBooks(),
        getMyReviews().catch(() => []),
        getChats().catch((err) => {
          console.error("Could not load chats:", err);
          return { myBooks: [], theirBooks: [] };
        }),
      ]);
      setOwnedBooks(Array.isArray(booksData.owned) ? booksData.owned : []);
      setBorrowedBooks(Array.isArray(booksData.borrowed) ? booksData.borrowed : []);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      const myBooks = Array.isArray(chatsData?.myBooks) ? chatsData.myBooks : [];
      const theirBooks = Array.isArray(chatsData?.theirBooks) ? chatsData.theirBooks : [];
      setAllChats([...myBooks, ...theirBooks]);
    } catch (_err) {
      console.error("Library fetch error:", _err);
      setOwnedBooks([]);
      setBorrowedBooks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const getChatIdForBook = useCallback((bookId) => {
    if (!bookId || allChats.length === 0) return null;
    const match = allChats.find((c) => String(c.bookId) === String(bookId));
    return match ? String(match.id) : null;
  }, [allChats]);

  const handleEditSubmit = async (values) => {
    try {
      const result = await updateBook(editingBook._id, values);
      setOwnedBooks((prev) => prev.map((b) => (b._id === result._id ? result : b)));
      setEditingBook(null);
    } catch (_err) {
      alert(_err?.message || "Could not update book.");
    }
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    try {
      await deleteBook(book._id);
      setOwnedBooks((prev) => prev.filter((b) => b._id !== book._id));
    } catch (_err) {
      alert(_err?.message || "Could not delete book.");
    }
  };

  const handleSetAvailability = async (book, makeAvailable) => {
    setIsActing(true);
    try {
      const result = await setBookAvailability(book._id, makeAvailable);
      setOwnedBooks((prev) => prev.map((b) => (b._id === result._id ? result : b)));
    } catch (_err) {
      alert(_err?.message || "Could not update availability.");
    } finally {
      setIsActing(false);
    }
  };

  const goToChat = (chatId) => {
    navigate(`/messages?chatId=${chatId}`);
  };

  const totalListed = ownedBooks.length;
  const totalAvailable = ownedBooks.filter((b) => b.status === "available").length;
  const totalOnLoan = totalListed - totalAvailable;

  return (
    <>
      <Navbar
        onSearchClick={() => navigate("/home")}
        onSearchFocus={() => navigate("/home")}
      />
      <div className="sidebar-layout">
        <Sidebar />
        <div className="content">
          <Breadcrumbs
            items={[{ label: "Home", to: "/home" }, { label: "My Library" }]}
          />
          <div className="library-container">
            <h1 className="heading-lg">My Library</h1>
            <p className="text-muted-sm admin-subtitle">
              Your listed books, borrowed books and reviews in one place.
            </p>

            {!isLoading && (
              <section className="admin-metrics">
                <div className="admin-card">
                  <p className="text-muted-xs admin-card-note">Listed</p>
                  <p className="admin-metric-value">{totalListed}</p>
                  <p className="text-muted-xs admin-card-note">Books you own</p>
                </div>
                <div className="admin-card">
                  <p className="text-muted-xs admin-card-note">Available</p>
                  <p className="admin-metric-value">{totalAvailable}</p>
                  <p className="text-muted-xs admin-card-note">Ready to lend</p>
                </div>
                <div className="admin-card">
                  <p className="text-muted-xs admin-card-note">On Loan</p>
                  <p className="admin-metric-value">{totalOnLoan}</p>
                  <p className="text-muted-xs admin-card-note">Currently borrowed out</p>
                </div>
                <div className="admin-card">
                  <p className="text-muted-xs admin-card-note">Borrowing</p>
                  <p className="admin-metric-value">{borrowedBooks.length}</p>
                  <p className="text-muted-xs admin-card-note">Books from others</p>
                </div>
              </section>
            )}

            {!isLoading && ownedBooks.length > 0 && (
              <section className="admin-grid-2 stack-space-sm">
                <StatusBreakdownChart books={ownedBooks} />
                <AvgRatingChart books={ownedBooks} />
              </section>
            )}

            <div className="admin-card">
              <div className="user-detail-tabs">
                {TABS.map((tab) => {
                  const count =
                    tab === "Listed Books" ? ownedBooks.length
                      : tab === "Borrowed Books" ? borrowedBooks.length
                        : reviews.length;
                  return (
                    <button
                      key={tab}
                      type="button"
                      className={`user-detail-tab${activeTab === tab ? " active" : ""}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="user-detail-content">
                {isLoading ? (
                  <p className="text-muted-xs admin-card-note">Loading your library...</p>
                ) : (
                  <>
                    {activeTab === "Listed Books" && (
                      ownedBooks.length === 0 ? (
                        <p className="text-muted-xs admin-card-note">
                          You haven't listed any books yet.
                        </p>
                      ) : (
                        <div className="user-detail-table-wrap">
                          <table className="admin-table admin-table-mobile user-detail-table">
                            <thead>
                              <tr>
                                <th>Book</th>
                                <th>Genre</th>
                                <th>Status</th>
                                <th>Held By</th>
                                <th>Rating</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ownedBooks.map((book) => {
                                const ownerId = book.owner && typeof book.owner === "object"
                                  ? String(book.owner._id) : String(book.owner || "");
                                const holderId = book.holder && typeof book.holder === "object"
                                  ? String(book.holder._id) : String(book.holder || "");
                                const holderName = book.holder && typeof book.holder === "object"
                                  ? book.holder.username : null;

                                // isLentOut: book is physically with a different person
                                const isLentOut = holderId !== ownerId;
                                // isOwnerLocked: owner chose to hide it (not lent, just locked)
                                const isOwnerLocked = !isLentOut && Boolean(book.ownerLocked);

                                const chatId = isLentOut ? getChatIdForBook(book._id) : null;

                                // Status label and pill colour
                                let statusLabel, statusClass;
                                if (isLentOut) {
                                  statusLabel = "ON LOAN";
                                  statusClass = "admin-pill-warning";
                                } else if (isOwnerLocked) {
                                  statusLabel = "UNAVAILABLE";
                                  statusClass = "admin-pill-danger";
                                } else {
                                  statusLabel = "AVAILABLE";
                                  statusClass = "admin-pill-success";
                                }

                                return (
                                  <tr key={book._id}>
                                    <td data-label="Book">
                                      <strong
                                        className="library-book-link"
                                        onClick={() => navigate(`/book?id=${book._id}`)}
                                      >
                                        {book.title || "Untitled"}
                                      </strong>
                                      <div className="text-muted-xs admin-card-note">
                                        {book.author || "Unknown author"}
                                      </div>
                                    </td>
                                    <td data-label="Genre">{book.genre || "—"}</td>
                                    <td data-label="Status">
                                      <span className={`admin-pill ${statusClass}`}>
                                        {statusLabel}
                                      </span>
                                    </td>

                                    <td data-label="Held By">{isLentOut && holderName ? holderName : "—"}</td>
                                    <td data-label="Rating">
                                      {book.avgReviews > 0
                                        ? `★ ${Number(book.avgReviews).toFixed(1)}`
                                        : <span className="text-muted-xs admin-card-note">No reviews</span>}
                                    </td>
                                    <td data-label="Actions">
                                      <div className="admin-actions">
                                        <button
                                          type="button"
                                          className="admin-button"
                                          disabled={isActing}
                                          onClick={() => setEditingBook(book)}
                                        >
                                          Edit
                                        </button>

                                        {!isLentOut && (
                                          <button
                                            type="button"
                                            className={`admin-button ${isOwnerLocked ? "admin-button-success" : "admin-button-warning"}`}
                                            disabled={isActing}
                                            onClick={() => handleSetAvailability(book, isOwnerLocked)}
                                          >
                                            {isOwnerLocked ? "Mark Available" : "Mark Unavailable"}
                                          </button>
                                        )}
                                        {isLentOut && chatId && (
                                          <button
                                            type="button"
                                            className="admin-button admin-button-blue"
                                            onClick={() => goToChat(chatId)}
                                          >
                                            Message Borrower
                                          </button>
                                        )}

                                        <button
                                          type="button"
                                          className="admin-button admin-button-danger"
                                          disabled={isActing}
                                          onClick={() => handleDelete(book)}
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )
                    )}
                    {activeTab === "Borrowed Books" && (
                      borrowedBooks.length === 0 ? (
                        <p className="text-muted-xs admin-card-note">
                          You're not borrowing any books right now.
                        </p>
                      ) : (
                        <div className="user-detail-table-wrap">
                          <table className="admin-table admin-table-mobile user-detail-table">
                            <thead>
                              <tr>
                                <th>Book</th>
                                <th>Genre</th>
                                <th>Owner</th>
                                <th>Rating</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {borrowedBooks.map((book) => {
                                const ownerName = typeof book.owner === "object"
                                  ? book.owner.username : "Unknown";
                                const chatId = getChatIdForBook(book._id);
                                return (
                                  <tr key={book._id}>
                                    <td data-label="Book">
                                      <strong
                                        className="library-book-link"
                                        onClick={() => navigate(`/book?id=${book._id}`)}
                                      >
                                        {book.title || "Untitled"}
                                      </strong>
                                      <div className="text-muted-xs admin-card-note">
                                        {book.author || "Unknown author"}
                                      </div>
                                    </td>
                                    <td data-label="Genre">{book.genre || "—"}</td>
                                    <td data-label="Owner">{ownerName}</td>
                                    <td data-label="Rating">
                                      {book.avgReviews > 0
                                        ? `★ ${Number(book.avgReviews).toFixed(1)}`
                                        : <span className="text-muted-xs admin-card-note">No reviews</span>}
                                    </td>
                                    <td data-label="Actions">
                                      {chatId ? (
                                        <button
                                          type="button"
                                          className="admin-button admin-button-blue"
                                          onClick={() => goToChat(chatId)}
                                        >
                                          Message Owner
                                        </button>
                                      ) : (
                                        <span className="text-muted-xs admin-card-note">—</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )
                    )}
                    {activeTab === "My Reviews" && (
                      reviews.length === 0 ? (
                        <p className="text-muted-xs admin-card-note">
                          You haven't written any reviews yet.
                        </p>
                      ) : (
                        <div className="user-detail-table-wrap">
                          <table className="admin-table admin-table-mobile user-detail-table">
                            <thead>
                              <tr>
                                <th>Book</th>
                                <th>Rating</th>
                                <th>Comment</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reviews.map((review) => (
                                <tr key={review._id}>
                                  <td data-label="Book">
                                    <strong
                                      className="library-book-link"
                                      onClick={() => navigate(`/book?id=${review.book?._id}`)}
                                    >
                                      {review.book?.title || "Unknown book"}
                                    </strong>
                                  </td>
                                  <td data-label="Rating">
                                    {"★".repeat(review.rating)}
                                    {"☆".repeat(5 - review.rating)}
                                  </td>
                                  <td data-label="Comment" className="user-detail-comment">
                                    {review.comment || "—"}
                                  </td>
                                  <td data-label="Date" className="text-muted-xs admin-card-note">
                                    {review.createdAt
                                      ? new Date(review.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric", month: "short", day: "numeric",
                                      })
                                      : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {editingBook ? (
        <BookForm
          key={editingBook._id}
          initialValues={{
            isbn: String(editingBook.isbn || ""),
            title: editingBook.title || "",
            author: editingBook.author || "",
            genre: editingBook.genre || "",
            description: editingBook.description || "",
          }}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditingBook(null)}
          modalTitle="Edit Book Listing"
        />
      ) : null}
    </>
  );
}