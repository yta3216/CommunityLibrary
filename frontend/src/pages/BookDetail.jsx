import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Breadcrumbs from "../components/Breadcrumbs/Breadcrumbs";
import BookCover from "../components/BookDetail/BookCover";
import BookActions from "../components/BookDetail/BookTags";
import ReviewSection from "../components/BookDetail/ReviewSection";
import MessageComposer from "../components/Messages/MessageComposer";
import { useAuth } from "../context/AuthContext";
import { getBook, returnBook } from "../api/books";
import { sendBorrowRequest } from "../api/chats";
import { useBookDetail } from "../hooks/useBookDetail";

function BookDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: currentUser } = useAuth();

  const selectedBookId = searchParams.get("id");
  const { book, updateBook, isLoading, errorMessage } = useBookDetail(selectedBookId);

  const [isBorrowComposerOpen, setIsBorrowComposerOpen] = useState(false);
  const [borrowDraft, setBorrowDraft] = useState("");
  const [borrowFeedback, setBorrowFeedback] = useState("");
  const [borrowError, setBorrowError] = useState("");
  const [isSendingBorrowMessage, setIsSendingBorrowMessage] = useState(false);
  const [isBookActionPending, setIsBookActionPending] = useState(false);
  const [bookActionError, setBookActionError] = useState("");

  const handleReturn = async () => {
    if (!book) return;

    setBookActionError("");
    setBorrowFeedback("");
    setIsBookActionPending(true);

    try {
      await returnBook(book.id);
      // Re-fetch the enriched book so all flags reflect the new state.
      const updated = await getBook(book.id);
      updateBook(updated);
      setBorrowFeedback("Book availability updated.");
    } catch (_error) {
      setBookActionError("Could not update this book right now.");
    } finally {
      setIsBookActionPending(false);
    }
  };

  const handleBorrowClick = () => {
    if (!book?.canBorrow) return;

    setBorrowError("");
    setBorrowFeedback("");
    setIsBorrowComposerOpen(true);
    if (!borrowDraft.trim()) {
      setBorrowDraft("Hi, I would like to borrow this book.");
    }
  };

  const handleViewConversation = () => {
    if (!book?.existingChatId) return;
    navigate(`/messages?chatId=${book.existingChatId}`);
  };

  const handleSendBorrowMessage = async () => {
    if (!book?.canBorrow) return;

    const messageText = borrowDraft.trim();
    if (!messageText) {
      setBorrowError("Type a message before sending.");
      return;
    }

    setBorrowError("");
    setBorrowFeedback("");
    setIsSendingBorrowMessage(true);

    try {
      const result = await sendBorrowRequest(book.id, messageText);
      setBorrowDraft("");
      setIsBorrowComposerOpen(false);
      navigate(`/messages?chatId=${result.id}`);
    } catch (_error) {
      setBorrowError(_error?.message || "Could not send your message.");
    } finally {
      setIsSendingBorrowMessage(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Navbar isLoggedIn={true} />
        <div style={styles.page}>
          <p style={styles.metaText}>Loading book...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div>
        <Navbar isLoggedIn={true} />
        <div style={styles.page}>
          <p className="text-error">
            {errorMessage || "This book could not be found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar isLoggedIn={true} />
      <Breadcrumbs
        items={[{ label: "Home", to: "/home" }, { label: "Book Item" }]}
      />

      <div style={styles.page}>
        <h1 style={styles.title}>{book.title}</h1>
        <h3 style={styles.author}>{book.author}</h3>
        <h3 style={styles.owner}>Owned by: {book.ownerName}</h3>

        <BookCover synopsis={book.description} />

        <BookActions
          genres={book.genres}
          listedBookAvailabilityText={
            book.status === "available"
              ? "This listing: Available"
              : "This listing: Not available"
          }
          showBorrowButton={book.showBorrowButton}
          isBorrowEnabled={book.canBorrow}
          showViewConversationButton={book.showViewConversationButton}
          showReturnButton={book.canReturn}
          actionHintText={book.actionHintText}
          onBorrow={handleBorrowClick}
          onViewConversation={handleViewConversation}
          onReturn={handleReturn}
          isActionPending={isBookActionPending}
        />

        {isBorrowComposerOpen ? (
          <div style={styles.borrowComposerBlock}>
            <h4 style={styles.borrowComposerTitle}>Start Borrow Request</h4>
            <MessageComposer
              value={borrowDraft}
              onChange={setBorrowDraft}
              onSubmit={handleSendBorrowMessage}
              isSubmitting={isSendingBorrowMessage}
              placeholder="Hi, I would like to borrow this book."
              buttonLabel="Send"
              disabled={!book.canBorrow}
            />
          </div>
        ) : null}

        {borrowError ? <p className="text-error">{borrowError}</p> : null}
        {bookActionError ? <p className="text-error">{bookActionError}</p> : null}
        {borrowFeedback ? <p className="text-success">{borrowFeedback}</p> : null}

        <ReviewSection
          bookId={book.id}
          currentUser={currentUser?._id}
          postedBy={book.ownerId}
        />

        {errorMessage ? <p className="text-error">{errorMessage}</p> : null}
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "32px 24px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    margin: "0 0 4px",
    color: "#000",
  },
  author: {
    fontSize: "1.2rem",
    fontWeight: "500",
    margin: "0",
    color: "#555",
  },
  owner: {
    fontSize: "1.1rem",
    fontWeight: "500",
    margin: "0 0 32px",
    color: "#555",
  },
  metaText: {
    color: "#667085",
    fontSize: "18px",
    margin: 0,
  },
  borrowComposerBlock: {
    marginBottom: "14px",
    padding: "14px",
    border: "1px solid #e4e7ec",
    borderRadius: "14px",
    backgroundColor: "#f8faf9",
  },
  borrowComposerTitle: {
    margin: "0 0 10px",
    fontSize: "1rem",
    fontWeight: 700,
    color: "#101828",
  },
};

export default BookDetail;