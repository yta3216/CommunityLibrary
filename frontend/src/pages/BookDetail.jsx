import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import BookCover from "../components/BookDetail/BookCover";
import BookActions from "../components/BookDetail/BookTags";
import ReviewSection from "../components/BookDetail/ReviewSection";
import MessageComposer from "../components/Messages/MessageComposer";
import {
  getBookUserId,
  isListingAvailable,
  toAvailableCopiesText,
} from "../utils/bookAvailability";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5050";

function mapRequesterChatsByBook(chatsPayload) {
  const requesterChats = Array.isArray(chatsPayload?.theirBooks)
    ? chatsPayload.theirBooks
    : [];

  return requesterChats.reduce((accumulator, chat) => {
    if (chat?.bookId && chat?.id) {
      accumulator[String(chat.bookId)] = String(chat.id);
    }
    return accumulator;
  }, {});
}

function BookDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
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
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const loadPage = async () => {
      try {
        setErrorMessage("");
        setIsLoading(true);

        const [userResponse, booksResponse, chatsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/api/books`),
          fetch(`${API_BASE_URL}/api/chats`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!userResponse.ok) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }

        const userData = await userResponse.json();
        const booksData = booksResponse.ok ? await booksResponse.json() : [];
        const chatsData = chatsResponse.ok ? await chatsResponse.json() : null;

        if (!isMounted) {
          return;
        }

        setCurrentUser(userData);
        setBooks(Array.isArray(booksData) ? booksData : []);
        setRequesterChatByBook(mapRequesterChatsByBook(chatsData));

        if (!booksResponse.ok) {
          setErrorMessage("Could not load books for this page.");
        }
      } catch (_error) {
        if (isMounted) {
          setErrorMessage("Could not load book details right now.");
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
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;

    const refreshBooksAndChats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          return;
        }

        const [booksResponse, chatsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/books`),
          fetch(`${API_BASE_URL}/api/chats`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!booksResponse.ok) {
          return;
        }

        const booksData = await booksResponse.json();
        if (isMounted && Array.isArray(booksData)) {
          setBooks(booksData);
          if (chatsResponse.ok) {
            const chatsData = await chatsResponse.json();
            setRequesterChatByBook(mapRequesterChatsByBook(chatsData));
          }
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

  const selectedBook = useMemo(() => {
    if (books.length === 0) {
      return null;
    }

    if (!selectedBookId) {
      return books[0];
    }

    return books.find((book) => book._id === selectedBookId) || books[0];
  }, [books, selectedBookId]);

  const book = useMemo(() => {
    if (!selectedBook) {
      return null;
    }
    const genres = (selectedBook.genre || "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

    return {
      id: selectedBook._id,
      title: selectedBook.title || "Untitled",
      author: selectedBook.author || "Unknown author",
      isbn: selectedBook.isbn,
      ownerId: getBookUserId(selectedBook.owner),
      holderId: getBookUserId(selectedBook.holder),
      ownerName:
        typeof selectedBook.owner === "object"
          ? selectedBook.owner?.username || "Book owner"
          : "Book owner",
      genres: genres.length > 0 ? genres : ["Unknown"],
      status: isListingAvailable(selectedBook) ? "available" : "not_available",
      description: selectedBook.description || "",
    };
  }, [selectedBook]);

  const availableCopiesByIsbn = useMemo(() => {
    if (!book?.isbn) {
      return 0;
    }

    const normalizedIsbn = String(book.isbn).trim();

    return books.filter((listedBook) => {
      const listedIsbn = String(listedBook?.isbn || "").trim();
      return listedIsbn === normalizedIsbn && isListingAvailable(listedBook);
    }).length;
  }, [books, book?.isbn]);

  const borrowAvailabilityText = useMemo(() => {
    if (!book?.isbn) {
      return "ISBN unavailable";
    }

    return toAvailableCopiesText(availableCopiesByIsbn);
  }, [availableCopiesByIsbn, book?.isbn]);

  const currentUserId = currentUser?._id || "";
  const isBookAvailable = book?.status === "available";
  const existingRequesterChatId = book ? requesterChatByBook[book.id] || "" : "";
  const hasExistingConversation = Boolean(existingRequesterChatId);
  const ownsCopyWithSameIsbn = useMemo(() => {
    if (!currentUserId || !book?.isbn) {
      return false;
    }

    const normalizedIsbn = String(book.isbn).trim();
    return books.some((listedBook) => {
      const listedIsbn = String(listedBook?.isbn || "").trim();
      return (
        listedIsbn === normalizedIsbn &&
        getBookUserId(listedBook.owner) === currentUserId
      );
    });
  }, [book?.isbn, books, currentUserId]);
  const holdsBorrowedCopyWithSameIsbn = useMemo(() => {
    if (!currentUserId || !book?.isbn) {
      return false;
    }

    const normalizedIsbn = String(book.isbn).trim();
    return books.some((listedBook) => {
      const listedIsbn = String(listedBook?.isbn || "").trim();
      const listedOwnerId = getBookUserId(listedBook.owner);
      const listedHolderId = getBookUserId(listedBook.holder);

      return (
        listedIsbn === normalizedIsbn &&
        listedHolderId === currentUserId &&
        listedOwnerId !== currentUserId
      );
    });
  }, [book?.isbn, books, currentUserId]);
  const isCurrentHolder = Boolean(
    currentUserId &&
      book &&
      currentUserId === book.holderId &&
      currentUserId !== book.ownerId,
  );

  const canBorrow = Boolean(
    book &&
      currentUserId &&
      !ownsCopyWithSameIsbn &&
      !holdsBorrowedCopyWithSameIsbn &&
      isBookAvailable &&
      !hasExistingConversation &&
      !isCurrentHolder,
  );
  const canReturn = Boolean(book && isCurrentHolder);

  const showBorrowButton = Boolean(
    !isCurrentHolder &&
      (ownsCopyWithSameIsbn || holdsBorrowedCopyWithSameIsbn || !hasExistingConversation),
  );
  const showViewConversationButton = Boolean(
    !isCurrentHolder && !ownsCopyWithSameIsbn && hasExistingConversation,
  );

  const actionHintText = useMemo(() => {
    if (ownsCopyWithSameIsbn) {
      return "You already own a copy of this book.";
    }

    if (holdsBorrowedCopyWithSameIsbn) {
      return "You are already borrowing another copy with this ISBN.";
    }

    if (showViewConversationButton) {
      return "You already started a conversation for this listing.";
    }

    if (!isBookAvailable && !isCurrentHolder) {
      return "This listing is currently not available for borrowing.";
    }

    return "";
  }, [
    ownsCopyWithSameIsbn,
    holdsBorrowedCopyWithSameIsbn,
    showViewConversationButton,
    isBookAvailable,
    isCurrentHolder,
  ]);

  useEffect(() => {
    if (hasExistingConversation && isBorrowComposerOpen) {
      setIsBorrowComposerOpen(false);
    }
  }, [hasExistingConversation, isBorrowComposerOpen]);

  async function updateBookByReturnEndpoint() {
    if (!book) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return;
    }

    setBookActionError("");
    setBorrowFeedback("");
    setIsBookActionPending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/books/${book.id}/return`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (!response.ok) {
        setBookActionError(result.message || "Could not update this book right now.");
        return;
      }

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

    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
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
      const response = await fetch(`${API_BASE_URL}/api/chats/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId: book.id,
          text: messageText,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setBorrowError(result.message || "Could not send your message.");
        return;
      }

      setBorrowDraft("");
      setIsBorrowComposerOpen(false);
      navigate(`/messages?chatId=${result.id}`);
    } catch (_error) {
      setBorrowError("Could not send your message.");
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

      <div style={styles.page}>
        {/* Book title */}
        <h1 style={styles.title}>{book.title}</h1>
        <h3 style={styles.author}>{book.author}</h3>

        {/* Cover image + synopsis */}
        <BookCover synopsis={book.description} />

        {/* Genre tags + action buttons */}
        <BookActions
          genres={book.genres}
          borrowAvailabilityText={borrowAvailabilityText}
          listedBookAvailabilityText={
            isBookAvailable ? "This listing: Available" : "This listing: Not available"
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
        {bookActionError ? <p style={styles.errorText}>{bookActionError}</p> : null}
        {borrowFeedback ? <p style={styles.successText}>{borrowFeedback}</p> : null}

        {/*Comments section*/}
        <ReviewSection currentUser={currentUser?._id} postedBy={book.ownerId} />

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
