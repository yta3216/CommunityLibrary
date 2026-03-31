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
      style={styles.form}
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
        style={styles.input}
        disabled={isDisabled}
      />
      <button type="submit" style={styles.button} disabled={isDisabled}>
        {isSubmitting ? "Sending..." : buttonLabel}
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  input: {
    flex: 1,
    minWidth: 0,
    border: "1px solid #d0d5dd",
    borderRadius: "12px",
    padding: "10px 12px",
    fontSize: "0.95rem",
    outline: "none",
  },
  button: {
    border: "none",
    borderRadius: "12px",
    padding: "10px 14px",
    backgroundColor: "#386f6d",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default MessageComposer;
