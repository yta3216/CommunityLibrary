import { useEffect, useRef, useState } from "react";

function ChevronIcon({ direction = "down" }) {
  const rotation = direction === "down" ? "0deg" : "180deg";

  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: `rotate(${rotation})` }}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ChevronButton({ direction = "down", onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.chevronButton}
      aria-label={label}
    >
      <ChevronIcon direction={direction} />
    </button>
  );
}

function ChatDrawer({
  chat,
  messages,
  isMinimized,
  onMinimize,
  onRestore,
  onSendMessage,
}) {
  const [draft, setDraft] = useState("");
  const messageEndRef = useRef(null);

  useEffect(() => {
    // Keep the latest messages in view whenever the open drawer updates.
    if (!isMinimized) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isMinimized, messages]);

  if (!chat) {
    return null;
  }

  // The page passes the selected operation, so the header stays tied to the clicked action.
  const title = `${chat.bookTitle} ${chat.operation}`;
  const statusOptions = ["Available", "Not Available"];
  const normalizedStatus =
    chat.bookStatus === "available" ? "Available" : "Not Available";

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedDraft = draft.trim();
    if (!trimmedDraft) {
      return;
    }

    onSendMessage(trimmedDraft);
    setDraft("");
  }

  if (isMinimized) {
    return (
      // Collapsed state keeps the conversation accessible without covering the page.
      <button type="button" style={styles.minimizedBar} onClick={onRestore}>
        <div>
          <p style={styles.minimizedTitle}>{chat.ownerName}</p>
          <p style={styles.minimizedSubtitle}>{title}</p>
        </div>
        <span style={styles.minimizedIcon} aria-hidden="true">
          <ChevronIcon direction="up" />
        </span>
      </button>
    );
  }

  return (
    <aside style={styles.drawer} aria-label={`${title} chat`}>
      <div style={styles.header}>
        <div style={styles.headerCopy}>
          <p style={styles.ownerName}>{chat.ownerName}</p>
          <p style={styles.chatTitle}>{title}</p>
        </div>
        <ChevronButton
          direction="down"
          onClick={onMinimize}
          label="Minimize chat"
        />
      </div>

      <div style={styles.messageList}>
        {messages.map((message) => {
          // Owner messages stay left and viewer messages stay right to mirror marketplace chats.
          const isOwner = message.sender === "owner";

          return (
            <div
              key={message.id}
              style={{
                ...styles.messageRow,
                justifyContent: isOwner ? "flex-start" : "flex-end",
              }}
            >
              <div
                style={{
                  ...styles.messageBubble,
                  ...(isOwner ? styles.ownerBubble : styles.viewerBubble),
                }}
              >
                {message.text}
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      <div style={styles.statusBlock}>
        <p style={styles.statusTitle}>Status</p>
        <div style={styles.statusPills}>
          {statusOptions.map((status) => (
            <span
              key={status}
              style={{
                ...styles.statusPill,
                ...(status === normalizedStatus
                  ? styles.statusPillActive
                  : null),
              }}
            >
              {status}
            </span>
          ))}
        </div>
      </div>

      <form style={styles.composer} onSubmit={handleSubmit}>
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Message..."
          style={styles.input}
        />
        <button
          type="submit"
          style={styles.sendButton}
          aria-label="Send message"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22l-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </aside>
  );
}

const styles = {
  drawer: {
    position: "fixed",
    right: "24px",
    bottom: "24px",
    width: "min(380px, calc(100vw - 32px))",
    maxHeight: "min(640px, calc(100vh - 48px))",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f4f4f1",
    border: "1px solid #d9ddd7",
    borderRadius: "28px 28px 18px 18px",
    boxShadow: "0 18px 48px rgba(32, 44, 37, 0.16)",
    overflow: "hidden",
    zIndex: 20,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 18px 10px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e2e5df",
  },
  headerCopy: {
    minWidth: 0,
  },
  ownerName: {
    margin: 0,
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "#161616",
  },
  chatTitle: {
    margin: "2px 0 0",
    fontSize: "1rem",
    fontWeight: 700,
    color: "#161616",
  },
  chevronButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    border: "none",
    borderRadius: "999px",
    backgroundColor: "transparent",
    color: "#161616",
    cursor: "pointer",
    flexShrink: 0,
  },
  messageList: {
    padding: "14px 14px 8px",
    overflowY: "auto",
    minHeight: "220px",
    backgroundColor: "#f4f4f1",
  },
  messageRow: {
    display: "flex",
    marginBottom: "12px",
  },
  messageBubble: {
    maxWidth: "78%",
    padding: "14px 16px",
    borderRadius: "18px",
    fontSize: "0.95rem",
    lineHeight: 1.4,
  },
  ownerBubble: {
    backgroundColor: "#d9d9d9",
    color: "#4a4a4a",
    borderTopLeftRadius: "12px",
  },
  viewerBubble: {
    backgroundColor: "#6c9f77",
    color: "#ffffff",
    borderTopRightRadius: "12px",
  },
  statusBlock: {
    padding: "0 18px 16px",
  },
  statusTitle: {
    margin: "4px 0 10px",
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#161616",
  },
  statusPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  statusPill: {
    minWidth: "92px",
    padding: "10px 14px",
    borderRadius: "12px",
    backgroundColor: "#d9d9d9",
    color: "#333333",
    fontSize: "0.92rem",
  },
  statusPillActive: {
    backgroundColor: "#c7d8cc",
  },
  composer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "0 14px 14px",
  },
  input: {
    flex: 1,
    border: "none",
    borderRadius: "16px",
    padding: "14px 16px",
    backgroundColor: "#d9d9d9",
    fontSize: "0.95rem",
    outline: "none",
  },
  sendButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "44px",
    height: "44px",
    border: "none",
    borderRadius: "16px",
    backgroundColor: "#d9d9d9",
    color: "#6a6f77",
    cursor: "pointer",
  },
  minimizedBar: {
    position: "fixed",
    right: "24px",
    bottom: "24px",
    width: "min(320px, calc(100vw - 32px))",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "14px 18px",
    border: "1px solid #d9ddd7",
    borderRadius: "18px",
    backgroundColor: "#ffffff",
    boxShadow: "0 12px 36px rgba(32, 44, 37, 0.16)",
    cursor: "pointer",
    zIndex: 20,
  },
  minimizedTitle: {
    margin: 0,
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#161616",
    textAlign: "left",
  },
  minimizedSubtitle: {
    margin: "2px 0 0",
    fontSize: "0.88rem",
    color: "#4d514f",
    textAlign: "left",
  },
  minimizedIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    color: "#161616",
    flexShrink: 0,
  },
};

export default ChatDrawer;
