import { formatTime } from "../../utils/formatTime";
import "./ChatListSection.css";

function ChatListSection({
  label,
  sectionKey,
  chats,
  activeChatId,
  onSelect,
}) {
  return (
    <section className="chat-list-section">
      <h2 className="heading-md">{label}</h2>

      {chats.length === 0 ? (
        <p className="text-muted-xs">No conversations yet.</p>
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
              className={`chat-list-card${isActive ? " chat-list-card--active" : ""}`}
            >
              <div className="chat-list-top-row">
                <span className="chat-list-title">{chat.bookTitle}</span>
                <span className="text-muted-xs chat-list-time">{formatTime(chat.lastMessageAt)}</span>
              </div>
              <p className="text-brand chat-list-person">{otherPerson}</p>
              <p className="text-muted-xs chat-list-preview">{chat.lastMessage || "No messages yet."}</p>
            </button>
          );
        })
      )}
    </section>
  );
}

export default ChatListSection;
