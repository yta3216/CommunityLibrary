// My Messages page — shows all active chat threads for the logged-in user,
// divided into two sections:
//   "My Books"    — other users who reached out about a book the current user owns
//   "Their Books" — conversations the current user started about someone else's book

import { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import ChatDrawer from "../components/BookDetail/ChatDrawer";

// ─── Mock data ────────────────────────────────────────────────────────────────
// TODO (backend): Replace INITIAL_CHATS with a call to GET /api/chats?userId=<currentUser._id>
//
// Expected API response shape:
//   { myBooks: [Chat], theirBooks: [Chat] }
//
// Each Chat mirrors a future "Conversation" document in the database:
//   id            — conversation _id (MongoDB ObjectId as string)
//   bookId        — Book._id (ref Book model)
//   bookTitle     — Book.title
//   bookStatus    — normalised to "available" | "not_available"
//                   (backend returns Book.status "with_owner" | "exchanged" | "lended";
//                    map "with_owner" → "available", anything else → "not_available")
//   ownerId       — Book.owner User._id  (the book's listed owner)
//   ownerName     — populated from User.name
//   requesterId   — User._id of the person who initiated the conversation
//   requesterName — populated from User.name
//   operation     — "Borrow" | "Exchange" | "Trade"
//   lastMessage   — text of the most recent message (used for list preview)
//   lastMessageAt — ISO timestamp used for sorting within each section
//   messages      — [{ id, sender: "owner" | "viewer", text }]
//                   "viewer" → right / green bubble (person wanting the book)
//                   "owner"  → left  / gray  bubble (the book owner)
//                   NOTE: once auth is live, remap sender so the current user's
//                   messages always appear on the right regardless of their role.
const INITIAL_CHATS = {
  // The current user owns these books; the items here are incoming requests.
  myBooks: [
    {
      id: "chat-1",
      bookId: "book-1",          // Book._id
      bookTitle: "Atomic Habits",
      bookStatus: "available",   // mapped from Book.status "with_owner"
      ownerId: "user-me",        // Book.owner — the current user
      ownerName: "Me",
      requesterId: "user-2",     // the other participant (User._id)
      requesterName: "Ava Chen",
      operation: "Borrow",
      lastMessage: "Cash works best for me.",
      lastMessageAt: new Date("2026-03-12T10:30:00"),
      messages: [
        { id: "m1", sender: "viewer", text: "Hi, is this still available? I can pick up on Monday." },
        { id: "m2", sender: "owner",  text: "Yes it is, Monday is fine." },
        { id: "m3", sender: "viewer", text: "Do you prefer cash or e-transfer?" },
        { id: "m4", sender: "owner",  text: "Cash works best for me." },
      ],
    },
    {
      id: "chat-2",
      bookId: "book-2",
      bookTitle: "Deep Work",
      bookStatus: "available",
      ownerId: "user-me",
      ownerName: "Me",
      requesterId: "user-3",
      requesterName: "Leo Park",
      operation: "Trade",
      lastMessage: "I have The Lean Startup if you are interested.",
      lastMessageAt: new Date("2026-03-11T18:45:00"),
      messages: [
        { id: "m5", sender: "viewer", text: "Hey, would you trade Deep Work for something?" },
        { id: "m6", sender: "owner",  text: "Maybe! What do you have?" },
        { id: "m7", sender: "viewer", text: "I have The Lean Startup if you are interested." },
      ],
    },
  ],

  // The current user initiated these conversations about someone else's book.
  theirBooks: [
    {
      id: "chat-3",
      bookId: "book-5",
      bookTitle: "The Alchemist",
      bookStatus: "available",
      ownerId: "user-4",
      ownerName: "Kiichiro Suganuma",
      requesterId: "user-me",
      requesterName: "Me",
      operation: "Exchange",
      lastMessage: "That could work. What condition is it in?",
      lastMessageAt: new Date("2026-03-12T09:15:00"),
      messages: [
        { id: "m8", sender: "viewer", text: "Hi, I have a copy of Dune if you want to exchange." },
        { id: "m9", sender: "owner",  text: "That could work. What condition is it in?" },
      ],
    },
    {
      id: "chat-4",
      bookId: "book-6",
      bookTitle: "Sapiens",
      bookStatus: "not_available", // mapped from Book.status "exchanged" or "lended"
      ownerId: "user-5",
      ownerName: "Mia Silva",
      requesterId: "user-me",
      requesterName: "Me",
      operation: "Borrow",
      lastMessage: "Sorry, it is no longer available.",
      lastMessageAt: new Date("2026-03-10T14:00:00"),
      messages: [
        { id: "m10", sender: "viewer", text: "Is this still available to borrow?" },
        { id: "m11", sender: "owner",  text: "Sorry, it is no longer available." },
      ],
    },
  ],
};

// ─── Trash / bin icon ─────────────────────────────────────────────────────────
function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

// ─── Chat card row ────────────────────────────────────────────────────────────
function ChatCard({ chat, isActive, section, onSelect, onDelete, formatTime }) {
  // In "My Books" the other person is the one who reached out (requesterName).
  // In "Their Books" the other person is the book owner (ownerName).
  const otherPerson =
    section === "myBooks" ? chat.requesterName : chat.ownerName;

  return (
    <div style={{ ...styles.card, ...(isActive ? styles.cardActive : null) }}>

      {/* Clickable area — opens the chat drawer for this conversation */}
      <button
        type="button"
        style={styles.cardBody}
        onClick={() => onSelect(chat)}
      >
        <div style={styles.cardTop}>
          <span style={styles.cardTitle}>
            {chat.bookTitle} · {chat.operation}
          </span>
          <span style={styles.cardTime}>{formatTime(chat.lastMessageAt)}</span>
        </div>
        <span style={styles.cardPerson}>{otherPerson}</span>
        <p style={styles.cardPreview}>{chat.lastMessage}</p>
      </button>

      {/* Delete button — removes this conversation */}
      <button
        type="button"
        style={styles.deleteBtn}
        onClick={() => onDelete(chat.id, section)}
        aria-label={`Delete chat about ${chat.bookTitle}`}
      >
        <TrashIcon />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function MyMessages() {
  const [chats, setChats] = useState(INITIAL_CHATS);

  // Store only the active chat ID; derive the full object from live state so the
  // drawer's messages always stay in sync with local updates automatically.
  const [activeChatId, setActiveChatId] = useState(null);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  // Derive the full active chat from state.
  const activeChat = activeChatId
    ? [...chats.myBooks, ...chats.theirBooks].find((c) => c.id === activeChatId)
    : null;

  // Build the object the ChatDrawer expects.
  // The drawer header should always show the OTHER person in the conversation,
  // not necessarily the book owner, so we remap ownerName here.
  // TODO (backend): derive which participant is "the other person" from
  //   currentUser._id vs chat.ownerId once authentication is implemented.
  const drawerChat = activeChat
    ? {
        ...activeChat,
        ownerName:
          activeChat.ownerId === "user-me"
            ? activeChat.requesterName // current user owns the book; other person is the requester
            : activeChat.ownerName,   // current user is the requester; other person is the owner
      }
    : null;

  // Format a timestamp into a short relative label (e.g. "2h ago").
  function formatTime(date) {
    const diffMs = Date.now() - date.getTime();
    const mins  = Math.floor(diffMs / 60000);
    const hrs   = Math.floor(diffMs / 3600000);
    const days  = Math.floor(diffMs / 86400000);
    if (mins < 1)  return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hrs  < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  }

  // Open the selected chat, replacing any currently open drawer.
  function handleSelectChat(chat) {
    setActiveChatId(chat.id);
    setIsChatMinimized(false);
  }

  // Remove a conversation from the list.
  // TODO (backend): call DELETE /api/chats/:chatId before updating local state.
  function handleDeleteChat(chatId, section) {
    setChats((prev) => ({
      ...prev,
      [section]: prev[section].filter((c) => c.id !== chatId),
    }));
    // Close the drawer if the deleted chat was open.
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  }

  // Append a new outgoing message to the active chat thread.
  // TODO (backend): call POST /api/chats/:chatId/messages, then refresh the
  //   thread from the response instead of updating local state directly.
  function handleSendMessage(text) {
    if (!activeChatId) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      // Current user's messages always render on the right ("viewer" side).
      // TODO (backend): derive sender from currentUser._id vs chat.ownerId.
      sender: "viewer",
      text,
    };

    // Update the messages array and the lastMessage preview in one pass.
    const appendTo = (list) =>
      list.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              lastMessage: text,
              lastMessageAt: new Date(),
            }
          : c
      );

    setChats((prev) => ({
      myBooks:    appendTo(prev.myBooks),
      theirBooks: appendTo(prev.theirBooks),
    }));
  }

  const SECTIONS = [
    { key: "myBooks",    label: "My Books",    list: chats.myBooks },
    { key: "theirBooks", label: "Their Books", list: chats.theirBooks },
  ];

  return (
    <div>
      <Navbar isLoggedIn={true} />

      <div style={styles.page}>
        <h1 style={styles.pageTitle}>My Messages</h1>

        {SECTIONS.map(({ key, label, list }) => (
          <section key={key} style={styles.section}>
            <h2 style={styles.sectionTitle}>{label}</h2>

            {list.length === 0 ? (
              <p style={styles.empty}>No conversations here yet.</p>
            ) : (
              // Sort most recently active conversations to the top.
              [...list]
                .sort((a, b) => b.lastMessageAt - a.lastMessageAt)
                .map((chat) => (
                  <ChatCard
                    key={chat.id}
                    chat={chat}
                    isActive={activeChatId === chat.id}
                    section={key}
                    onSelect={handleSelectChat}
                    onDelete={handleDeleteChat}
                    formatTime={formatTime}
                  />
                ))
            )}
          </section>
        ))}
      </div>

      {/* Single drawer — replaced whenever a different chat row is clicked */}
      <ChatDrawer
        chat={drawerChat}
        messages={activeChat ? activeChat.messages : []}
        isMinimized={isChatMinimized}
        onMinimize={() => setIsChatMinimized(true)}
        onRestore={() => setIsChatMinimized(false)}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  page: {
    maxWidth: "720px",
    margin: "0 auto",
    // Extra bottom padding so the open drawer never covers the last card.
    padding: "32px 24px 160px",
  },
  pageTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    margin: "0 0 32px",
    color: "#000",
  },
  section: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#4f7f7c",
    margin: "0 0 14px",
    paddingBottom: "8px",
    borderBottom: "2px solid #e0e0e0",
  },
  empty: {
    fontSize: "0.9rem",
    color: "#888",
    margin: 0,
  },
  card: {
    display: "flex",
    alignItems: "stretch",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e5df",
    borderRadius: "14px",
    marginBottom: "10px",
    overflow: "hidden",
  },
  // Highlighted border when this chat's drawer is open.
  cardActive: {
    border: "1px solid #4f7f7c",
    boxShadow: "0 0 0 3px rgba(79, 127, 124, 0.12)",
  },
  cardBody: {
    flex: 1,
    minWidth: 0, // allows text-overflow truncation inside a flex child
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "4px",
    padding: "14px 16px",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    width: "100%",
  },
  cardTitle: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#161616",
  },
  cardTime: {
    fontSize: "0.78rem",
    color: "#888",
    flexShrink: 0,
    marginLeft: "8px",
  },
  cardPerson: {
    fontSize: "0.88rem",
    fontWeight: "600",
    color: "#4f7f7c",
  },
  cardPreview: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#666",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    width: "100%",
  },
  // Bin icon button on the right edge of each card.
  deleteBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "48px",
    flexShrink: 0,
    background: "none",
    border: "none",
    borderLeft: "1px solid #e2e5df",
    color: "#bbb",
    cursor: "pointer",
  },
};

export default MyMessages;
