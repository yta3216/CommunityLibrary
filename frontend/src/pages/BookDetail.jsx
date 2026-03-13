import { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import BookCover from "../components/BookDetail/BookCover";
import BookActions from "../components/BookDetail/BookTags";
import ChatDrawer from "../components/BookDetail/ChatDrawer";
import SimilarBooks from "../components/BookDetail/SimilarBooks";
import ReviewSection from "../components/BookDetail/ReviewSection";

function BookDetail() {
  // Replace this mock listing with the book payload loaded from the backend.
  const book = {
    id: "book-1",
    title: "Atomic Habits",
    author: "James Clear",
    ownerId: "owner-1",
    ownerName: "Kiichiro Suganuma",
    genres: ["Self-help", "Habits", "Psychology", "Personal Growth"],
    status: "available",
  };

  // Replace these seeded threads with messages fetched per listing + operation.
  const initialThreads = {
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

  const [chatThreads, setChatThreads] = useState(initialThreads);
  const [activeChat, setActiveChat] = useState(null);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  // Keep the page logic simple: one backend status determines whether any action can start a chat.
  const isBookAvailable = book.status === "available";

  function handleOpenChat(operation) {
    if (!isBookAvailable) {
      return;
    }

    // Store the selected action so the drawer title becomes: Book Name + Operation.
    // When the backend is ready, open or create the conversation record here.
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

    // For now this updates local UI state immediately so the chat feels responsive.
    // Swap this local append for a message POST, then refresh from the saved thread.
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

  return (
    <div>
      <Navbar isLoggedIn={true} />

      <div style={styles.page}>
        {/* Book title */}
        <h1 style={styles.title}>{book.title}</h1>
        <h3 style={styles.author}>{book.author}</h3>

        {/* Cover image + synopsis */}
        <BookCover />

        {/* Genre tags + action buttons */}
        <BookActions
          genres={book.genres}
          bookStatus={book.status}
          onActionSelect={handleOpenChat}
        />

        {/* Similar books row */}
        <SimilarBooks />

        {/*Comments section*/}
        <ReviewSection currentUser="currentUser" postedBy="bookOwner"/>

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
  }
};

export default BookDetail;
