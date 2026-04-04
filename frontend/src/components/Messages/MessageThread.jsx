function MessageThread({ messages, emptyText = "No messages yet." }) {
  if (!messages || messages.length === 0) {
    return <p style={styles.empty}>{emptyText}</p>;
  }

  return (
    <div style={styles.wrapper}>
      {messages.map((message) => {
        const bubbleStyle = message.isMine ? styles.mineBubble : styles.theirsBubble;
        const rowStyle = message.isMine ? styles.mineRow : styles.theirsRow;

        return (
          <div key={message.id} style={{ ...styles.row, ...rowStyle }}>
            <div style={{ ...styles.bubble, ...bubbleStyle }}>
              <p style={styles.text}>{message.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    overflowY: "auto",
    height: "100%",
    paddingRight: "6px",
  },
  empty: {
    margin: 0,
    color: "#667085",
    fontSize: "0.95rem",
  },
  row: {
    display: "flex",
    width: "100%",
  },
  mineRow: {
    justifyContent: "flex-end",
  },
  theirsRow: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: "14px",
    padding: "10px 12px",
  },
  mineBubble: {
    backgroundColor: "#4f7f7c",
    color: "#fff",
  },
  theirsBubble: {
    backgroundColor: "#eaecf0",
    color: "#101828",
  },
  text: {
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontSize: "0.92rem",
    lineHeight: 1.35,
  },
};

export default MessageThread;
