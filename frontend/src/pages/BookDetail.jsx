import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Breadcrumbs from "../components/Breadcrumbs/Breadcrumbs";
import BookCover from "../components/BookDetail/BookCover";
import BookActions from "../components/BookDetail/BookTags";
import ReviewSection from "../components/BookDetail/ReviewSection";
import MessageComposer from "../components/Messages/MessageComposer";
import { useAuth } from "../context/AuthContext";
import { getBooks, returnBook } from "../api/books";
import { getChats, sendBorrowRequest } from "../api/chats";
import {
  buildBookActionState,
  mapRequesterChatsByBook,
  selectBookFromCollection,
  toBookDetailModel,
} from "../api/bookDetail";

function BookDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const { user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isBorrowComposerOpen, setIsBorrowComposerOpen] = useState(false);
  const [borrowDraft, setBorrowDraft] = useState("");
  const [borrowFeedback, setBorrowFeedback] = useState("");
  const [borrowError, setBorrowError] = useState("");
  const [isSendingBorrowMessage, setIsSendingBorrowMessage] = useState(false);
  const [isBookActionPending, setIsBookActionPending] = useState(false);
  const [bookActionError, setBookActionError] = useState("");
  const [requesterChatByBook, setRequesterChatByBook] = useState({});

  useEffect(() => {
    let isMounted = true;

    const loadPage = async () => {
      try {
        setErrorMessage("");
        setIsLoading(true);

        const [booksData, chatsData] = await Promise.all([
          getBooks(),
          getChats(),
        ]);

        if (!isMounted) {
          return;
        }

        setBooks(Array.isArray(booksData) ? booksData : []);
        setRequesterChatByBook(mapRequesterChatsByBook(chatsData));
      } catch (_error) {
        if (isMounted) {
          setErrorMessage(
            _error?.message || "Could not load book details right now.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPage();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const refreshBooksAndChats = async () => {
      try {
        const [booksData, chatsData] = await Promise.all([
          getBooks(),
          getChats(),
        ]);

        if (isMounted && Array.isArray(booksData)) {
          setBooks(booksData);
          setRequesterChatByBook(mapRequesterChatsByBook(chatsData));
        }
      } catch (_error) {
        // Polling failures are ignored; next interval retry will attempt again.
      }
    };

    const pollTimerId = window.setInterval(refreshBooksAndChats, 10000);

    return () => {
      isMounted = false;
      window.clearInterval(pollTimerId);
    };
  }, []);

  const selectedBookId = searchParams.get("id");

  const selectedBook = useMemo(
    () => selectBookFromCollection(books, selectedBookId),
    [books, selectedBookId],
  );

  const book = useMemo(() => toBookDetailModel(selectedBook), [selectedBook]);

  const currentUserId = currentUser?._id || "";

  const {
    isBookAvailable,
    existingRequesterChatId,
    hasExistingConversation,
    isCurrentHolder,
    canBorrow,
    canReturn,
    showBorrowButton,
    showViewConversationButton,
    actionHintText,
  } = useMemo(
    () =>
      buildBookActionState({
        book,
        books,
        currentUserId,
        requesterChatByBook,
      }),
    [book, books, currentUserId, requesterChatByBook],
  );

  useEffect(() => {
    if (hasExistingConversation && isBorrowComposerOpen) {
      setIsBorrowComposerOpen(false);
    }
  }, [hasExistingConversation, isBorrowComposerOpen]);

  async function updateBookByReturnEndpoint() {
    if (!book) {
      return;
    }

    setBookActionError("");
    setBorrowFeedback("");
    setIsBookActionPending(true);

    try {
      const result = await returnBook(book.id);

      setBooks((currentBooks) =>
        currentBooks.map((listedBook) =>
          listedBook._id === result._id ? result : listedBook,
        ),
      );
      setBorrowFeedback("Book availability updated.");
    } catch (_error) {
      setBookActionError("Could not update this book right now.");
    } finally {
      setIsBookActionPending(false);
    }
  }

  function handleBorrowClick() {
    if (!canBorrow) {
      return;
    }

    setBorrowError("");
    setBorrowFeedback("");
    setIsBorrowComposerOpen(true);
    if (!borrowDraft.trim()) {
      setBorrowDraft("Hi, I would like to borrow this book.");
    }
  }

  function handleViewConversation() {
    if (!existingRequesterChatId) {
      return;
    }

    navigate(`/messages?chatId=${existingRequesterChatId}`);
  }

  async function handleSendBorrowMessage() {
    if (!book || !canBorrow) {
      return;
    }

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
  }

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
          <p style={styles.errorText}>
            {errorMessage || "No books are available yet."}
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
        {/* Book title */}
        <h1 style={styles.title}>{book.title}</h1>
        <h3 style={styles.author}>{book.author}</h3>
        <h3 style={styles.owner}>Owned by: {book.ownerName || "Unknown"}</h3>

        {/* Cover image + synopsis */}
        <BookCover synopsis={book.description} />

        {/* Genre tags + action buttons */}
        <BookActions
          genres={book.genres}
          listedBookAvailabilityText={
            isBookAvailable
              ? "This listing: Available"
              : "This listing: Not available"
          }
          showBorrowButton={showBorrowButton}
          isBorrowEnabled={canBorrow}
          showViewConversationButton={showViewConversationButton}
          showReturnButton={canReturn}
          actionHintText={actionHintText}
          onBorrow={handleBorrowClick}
          onViewConversation={handleViewConversation}
          onReturn={updateBookByReturnEndpoint}
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
              disabled={!canBorrow}
            />
          </div>
        ) : null}

        {borrowError ? <p style={styles.errorText}>{borrowError}</p> : null}
        {bookActionError ? (
          <p style={styles.errorText}>{bookActionError}</p>
        ) : null}
        {borrowFeedback ? (
          <p style={styles.successText}>{borrowFeedback}</p>
        ) : null}

        {/*Comments section*/}
        <ReviewSection
          bookId={book.id}
          currentUser={currentUser?._id}
          postedBy={book.ownerId}
        />

        {errorMessage ? <p style={styles.errorText}>{errorMessage}</p> : null}
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
  errorText: {
    color: "#b42318",
    fontSize: "18px",
    margin: "8px 0 0",
  },
  successText: {
    color: "#067647",
    fontSize: "16px",
    margin: "8px 0 0",
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
