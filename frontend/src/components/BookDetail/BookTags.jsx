// Displays the genre tags and action buttons (Borrow, Exchange, Trade).

function BookActions({ genres, bookStatus, onActionSelect }) {
  const genreList = genres || ["Horror", "Romance", "Action", "Sci-fi"];
  const actions = ["Borrow", "Exchange", "Trade"];
  // A single listing status now controls all three buttons together.
  // This should come from the single availability status returned by the backend.
  const isAvailable = (bookStatus || "available") === "available";

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
          {actions.map((action, i) => {
            return (
              <button
                key={i}
                type="button"
                disabled={!isAvailable}
                onClick={() => {
                  // Only forward the click when the listing is currently available.
                  if (isAvailable) {
                    onActionSelect?.(action);
                  }
                }}
                style={{
                  ...styles.button,
                  backgroundColor: isAvailable ? "#4f7f7c" : "#e0e0e0",
                  color: isAvailable ? "#fff" : "#333",
                  cursor: isAvailable ? "pointer" : "not-allowed",
                  opacity: isAvailable ? 1 : 0.95,
                }}
              >
                {action}
              </button>
            );
          })}
        </div>
      </div>
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
  button: {
    padding: "8px 28px",
    borderRadius: "20px",
    border: "none",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontWeight: "500",
  },
};

export default BookActions;
