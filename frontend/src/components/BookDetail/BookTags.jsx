// Displays genre tags and borrow/return availability actions for a listing

function BookActions({
  genres,
  borrowAvailabilityText,
  showBorrowButton,
  isBorrowEnabled,
  showViewConversationButton,
  showReturnButton,
  actionHintText,
  onBorrow,
  onViewConversation,
  onReturn,
  isActionPending,
}) {
  const genreList = genres || ["Horror", "Romance", "Action", "Sci-fi"];
  const isBorrowDisabled = !isBorrowEnabled || isActionPending;
  const isActionDisabled = isActionPending;

  const borrowButtonStyle = isBorrowDisabled
    ? styles.buttonDisabled
    : styles.buttonEnabled;
  const actionButtonStyle = isActionDisabled
    ? styles.buttonDisabled
    : styles.buttonEnabled;

  return (
    <div style={styles.wrapper}>
      {/* Genre row */}
      <div style={styles.row}>
        <span style={styles.label}>Genre</span>
        <div style={styles.tags}>
          {genreList.map((genre, i) => (
            <span key={i} style={styles.tag}>
              {genre}
            </span>
          ))}
        </div>
      </div>

      {/* Actions row */}
      <div style={styles.row}>
        <span style={styles.label}>Actions</span>
        <div style={styles.buttons}>
          {showBorrowButton ? (
            <div style={styles.borrowGroup}>
              <button
                type="button"
                disabled={isBorrowDisabled}
                onClick={() => onBorrow?.()}
                style={borrowButtonStyle}
              >
                Borrow
              </button>
            </div>
          ) : null}

          {showViewConversationButton ? (
            <button
              type="button"
              onClick={() => onViewConversation?.()}
              style={actionButtonStyle}
              disabled={isActionDisabled}
            >
              View Conversation
            </button>
          ) : null}

          {showReturnButton ? (
            <button
              type="button"
              onClick={() => onReturn?.()}
              style={actionButtonStyle}
              disabled={isActionDisabled}
            >
              Return
            </button>
          ) : null}
          <span style={styles.availabilityText}>
            {borrowAvailabilityText || "0 copies available"}
          </span>
        </div>
      </div>

      {actionHintText ? <p style={styles.actionHint}>{actionHintText}</p> : null}
    </div>
  );
}

const styles = {
  wrapper: {
    marginBottom: "32px",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "24px",
    marginBottom: "16px",
  },
  label: {
    fontWeight: "700",
    fontSize: "1rem",
    width: "80px",
    flexShrink: 0,
    color: "#000",
  },
  tags: {
    display: "flex",
    gap: "16px",
  },
  tag: {
    fontSize: "0.9rem",
    color: "#000",
    cursor: "pointer",
  },
  buttons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
  },
  borrowGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  button: {
    padding: "8px 28px",
    borderRadius: "20px",
    border: "none",
    fontSize: "0.9rem",
    cursor: "not-allowed",
    fontWeight: "500",
  },
  buttonEnabled: {
    padding: "8px 28px",
    borderRadius: "20px",
    border: "none",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontWeight: "500",
    backgroundColor: "#4f7f7c",
    color: "#fff",
    opacity: 1,
  },
  buttonDisabled: {
    padding: "8px 28px",
    borderRadius: "20px",
    border: "none",
    fontSize: "0.9rem",
    cursor: "not-allowed",
    fontWeight: "500",
    backgroundColor: "#e0e0e0",
    color: "#333",
    opacity: 0.95,
  },
  actionHint: {
    margin: "-4px 0 12px 104px",
    color: "#667085",
    fontSize: "0.85rem",
  },
  availabilityText: {
    color: "#475467",
    fontSize: "0.9rem",
    fontWeight: "500",
    alignSelf: "center",
  },
};

export default BookActions;
