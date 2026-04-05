function MessageComposer({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  placeholder = "Write a message...",
  buttonLabel = "Send",
  disabled = false,
}) {
  const isDisabled = disabled || isSubmitting;

  return (
    <form
      className="modal-button-row"
      onSubmit={(event) => {
        event.preventDefault();
        if (!isDisabled) {
          onSubmit?.();
        }
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="form-input"
        disabled={isDisabled}
      />
      <button type="submit" className="button-primary" disabled={isDisabled}>
        {isSubmitting ? "Sending..." : buttonLabel}
      </button>
    </form>
  );
}

export default MessageComposer;
