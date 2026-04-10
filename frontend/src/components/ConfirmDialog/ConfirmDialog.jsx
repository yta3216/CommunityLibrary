import "./ConfirmDialog.css";

export default function ConfirmDialog({
  isOpen,
  title = "Confirm",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDangerous = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog-header">
          <h2 className="confirm-dialog-title">{title}</h2>
          <button
            className="confirm-dialog-close"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            x
          </button>
        </div>
        <div className="confirm-dialog-content">
          <p>{message}</p>
        </div>
        <div className="confirm-dialog-actions">
          <button className="confirm-dialog-button cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`confirm-dialog-button confirm ${isDangerous ? "dangerous" : ""}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
