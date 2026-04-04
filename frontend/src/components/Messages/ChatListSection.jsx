import { formatTime } from "../../utils/formatTime";

function ChatListSection({
  label,
  sectionKey,
  chats,
  activeChatId,
  onSelect,
}) {
  return (
    <section style={styles.section}>
      <h2 style={styles.heading}>{label}</h2>

      {chats.length === 0 ? (
        <p style={styles.empty}>No conversations yet.</p>
      ) : (
        chats.map((chat) => {
          const isActive = chat.id === activeChatId;
          const otherPerson =
            sectionKey === "myBooks" ? chat.requesterName : chat.ownerName;

          return (
            <button
              key={chat.id}
              type="button"
              onClick={() => onSelect?.(chat.id)}
              style={{ ...styles.card, ...(isActive ? styles.cardActive : null) }}
            >
              <div style={styles.topRow}>
                <span style={styles.title}>{chat.bookTitle}</span>
                <span style={styles.time}>{formatTime(chat.lastMessageAt)}</span>
              </div>
              <p style={styles.person}>{otherPerson}</p>
              <p style={styles.preview}>{chat.lastMessage || "No messages yet."}</p>
            </button>
          );
        })
      )}
    </section>
  );
}

const styles = {
  section: {
    marginBottom: "22px",
  },
  heading: {
    margin: "0 0 10px",
    color: "#3b5d5b",
    fontSize: "1rem",
    fontWeight: 700,
  },
  empty: {
    margin: 0,
    color: "#667085",
    fontSize: "0.9rem",
  },
  card: {
    width: "100%",
    textAlign: "left",
    border: "1px solid #e4e7ec",
    borderRadius: "12px",
    backgroundColor: "#fff",
    padding: "10px 12px",
    marginBottom: "8px",
    cursor: "pointer",
  },
  cardActive: {
    borderColor: "#4f7f7c",
    boxShadow: "0 0 0 2px rgba(79, 127, 124, 0.16)",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "baseline",
  },
  title: {
    fontWeight: 700,
    color: "#101828",
    fontSize: "0.9rem",
  },
  time: {
    color: "#667085",
    fontSize: "0.75rem",
    flexShrink: 0,
  },
  person: {
    margin: "4px 0 2px",
    color: "#3b5d5b",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  preview: {
    margin: 0,
    color: "#475467",
    fontSize: "0.82rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};

export default ChatListSection;
