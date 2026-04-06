// Displays genre tags and borrow/return availability actions for a listing

import "./BookTags.css";

function BookActions({
  genres,
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

  return (
    <div className="book-tags-wrapper">
      {/* Genre row */}
      <div className="book-tags-row">
        <span className="book-label">Genre</span>
        <div className="book-tags-tags">
          {genreList.map((genre, i) => (
            <span key={i} className="book-tags-tag">
              {genre}
            </span>
          ))}
        </div>
      </div>

      {/* Actions row */}
      <div className="book-tags-row">
        <span className="book-label">Actions</span>
        <div className="book-tags-buttons">
          {showBorrowButton ? (
            <div className="book-tags-borrow-group">
              <button
                type="button"
                disabled={isBorrowDisabled}
                onClick={() => onBorrow?.()}
                className={`book-tags-button ${isBorrowDisabled ? "book-tags-button--disabled" : "book-tags-button--enabled"}`}
              >
                Borrow
              </button>
            </div>
          ) : null}

          {showViewConversationButton ? (
            <button
              type="button"
              onClick={() => onViewConversation?.()}
              className={`book-tags-button ${isActionDisabled ? "book-tags-button--disabled" : "book-tags-button--enabled"}`}
              disabled={isActionDisabled}
            >
              View Conversation
            </button>
          ) : null}

          {showReturnButton ? (
            <button
              type="button"
              onClick={() => onReturn?.()}
              className={`book-tags-button ${isActionDisabled ? "book-tags-button--disabled" : "book-tags-button--enabled"}`}
              disabled={isActionDisabled}
            >
              Return
            </button>
          ) : null}
        </div>
      </div>

      {actionHintText ? <p className="text-muted-xs book-tags-action-hint">{actionHintText}</p> : null}
    </div>
  );
}

export default BookActions;
