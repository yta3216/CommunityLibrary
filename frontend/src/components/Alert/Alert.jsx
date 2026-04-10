import { useEffect } from "react";
import "./Alert.css";

export default function Alert({ message, type = "error", onDismiss, autoDismiss = 5000 }) {
  useEffect(() => {
    if (autoDismiss && message) {
      const timer = setTimeout(onDismiss, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [message, autoDismiss, onDismiss]);

  if (!message) return null;

  return (
    <div className={`alert alert-${type}`}>
      <span className="alert-message">{message}</span>
      <button
        className="alert-close"
        onClick={onDismiss}
        aria-label="Dismiss alert"
      >
        ×
      </button>
    </div>
  );
}
