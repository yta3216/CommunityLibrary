import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import BookCover from "../components/BookDetail/BookCover";
import BookActions from "../components/BookDetail/BookTags";
import ChatDrawer from "../components/BookDetail/ChatDrawer";
import ReviewSection from "../components/BookDetail/ReviewSection";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5050";

const INITIAL_THREADS = {
  Borrow: [
    {
      id: "borrow-1",
      sender: "viewer",
      text: "Hi, is this still available? I can pick up on Monday evening.",
    },
    {
      id: "borrow-2",
      sender: "owner",
      text: "Yes, Monday is fine.",
    },
    {
      id: "borrow-3",
      sender: "viewer",
      text: "Do you prefer cash or e-transfer?",
    },
    {
      id: "borrow-4",
      sender: "owner",
      text: "Cash works best for me.",
    },
  ],
  Exchange: [
    {
      id: "exchange-1",
      sender: "viewer",
      text: "Hi, I have a copy of The Alchemist if you want to exchange.",
    },
    {
      id: "exchange-2",
      sender: "owner",
      text: "That could work. What condition is it in?",
    },
  ],
  Trade: [
    {
      id: "trade-1",
      sender: "owner",
      text: "Trade is not available for this listing right now.",
    },
  ],
};

function BookDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [chatThreads, setChatThreads] = useState(INITIAL_THREADS);
  const [activeChat, setActiveChat] = useState(null);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

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

        const [userResponse, booksResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/api/books`),
        ]);

        if (!userResponse.ok) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }

        const userData = await userResponse.json();
        const booksData = booksResponse.ok ? await booksResponse.json() : [];

        if (!isMounted) {
          return;
        }

        setCurrentUser(userData);
        setBooks(Array.isArray(booksData) ? booksData : []);

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

    const ownerData =
      typeof selectedBook.owner === "object" ? selectedBook.owner : null;
    const holderData =
      typeof selectedBook.holder === "object" ? selectedBook.holder : null;

    const ownerId = ownerData?._id || selectedBook.owner || "";
    const holderId = holderData?._id || selectedBook.holder || "";
    const rawStatus = (selectedBook.status || "").toLowerCase();

    const isAvailableByStatus =
      rawStatus === "available" || rawStatus === "with_owner";
    const isAvailableByOwnership =
      ownerId && holderId && ownerId.toString() === holderId.toString();

    const genres = (selectedBook.genre || "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

    return {
      id: selectedBook._id,
      title: selectedBook.title || "Untitled",
      author: selectedBook.author || "Unknown author",
      ownerId,
      holderId,
      ownerName: ownerData?.username || "Book owner",
      genres: genres.length > 0 ? genres : ["Unknown"],
      status:
        isAvailableByOwnership || isAvailableByStatus
          ? "available"
          : "not_available",
      description: selectedBook.description || "",
    };
  }, [selectedBook]);

  const isBookAvailable = book?.status === "available";

  function handleOpenChat(operation) {
    if (!book || !isBookAvailable) {
      return;
    }

    // Store the selected action so the drawer title becomes: Book Name + Operation
    // When the backend is ready, open or create the conversation record here
    setActiveChat({
      bookId: book.id,
      bookTitle: book.title,
      ownerId: book.ownerId,
      ownerName: book.ownerName,
      bookStatus: book.status,
      operation,
    });
    setIsChatMinimized(false);
  }

  function handleSendMessage(text) {
    if (!activeChat) {
      return;
    }

    // For now this updates local UI state immediately so the chat feels responsive
    // Swap this local append for a message POST, then refresh from the saved thread
    setChatThreads((currentThreads) => {
      const currentMessages = currentThreads[activeChat.operation] || [];

      return {
        ...currentThreads,
        [activeChat.operation]: [
          ...currentMessages,
          {
            id: `${activeChat.operation.toLowerCase()}-${Date.now()}`,
            sender: "viewer",
            text,
          },
        ],
      };
    });
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
          bookStatus={book.status}
          onActionSelect={handleOpenChat}
        />

        {/*Comments section*/}
        <ReviewSection bookId={book.id} currentUser={currentUser?._id} postedBy={book.ownerId} />

        {errorMessage ? <p style={styles.errorText}>{errorMessage}</p> : null}
      </div>

      <ChatDrawer
        chat={activeChat}
        messages={activeChat ? chatThreads[activeChat.operation] || [] : []}
        isMinimized={isChatMinimized}
        onMinimize={() => setIsChatMinimized(true)}
        onRestore={() => setIsChatMinimized(false)}
        onSendMessage={handleSendMessage}
      />
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
};

export default BookDetail;
