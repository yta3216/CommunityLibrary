import { useEffect, useRef } from "react";
import "./MessageThread.css";

function MessageThread({ messages, emptyText = "No messages yet." }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!messages || messages.length === 0) {
    return <p className="text-muted-sm">{emptyText}</p>;
  }

  return (
    <div className="message-thread-wrapper" ref={containerRef}>
      {messages.map((message) => {
        const rowClass = message.isMine ? "message-thread-row--mine" : "message-thread-row--theirs";
        const bubbleClass = message.isMine ? "message-thread-bubble--mine" : "message-thread-bubble--theirs";

        return (
          <div key={message.id} className={`message-thread-row ${rowClass}`}>
            <div className={`message-thread-bubble ${bubbleClass}`}>
              <p className="message-thread-text">{message.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MessageThread;
