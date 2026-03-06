import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5050";

const LoggedInHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const loadMe = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        if (!response.ok) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }

        setUser(result);
      } catch (_error) {
        setErrorMessage("Failed to load account information.");
      }
    };

    loadMe();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome to Community Library</h1>
        <p style={styles.text}>
          {user
            ? `${user.name} (${user.username}) is logged in.`
            : "Loading account..."}
        </p>
        {errorMessage ? <p style={styles.error}>{errorMessage}</p> : null}

        <div style={styles.buttonRow}>
          <Link to="/" style={styles.linkButton}>
            Public Home
          </Link>
          <button
            type="button"
            style={styles.logoutButton}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100dvh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f2f5",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "560px",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 16px rgba(0, 0, 0, 0.08)",
    padding: "24px",
    textAlign: "center",
  },
  title: {
    margin: "0 0 16px",
    fontSize: "32px",
  },
  text: {
    margin: "0 0 16px",
    fontSize: "18px",
  },
  error: {
    margin: "0 0 16px",
    fontSize: "16px",
    color: "#b42318",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  linkButton: {
    textDecoration: "none",
    background: "#6f6f72",
    color: "#fff",
    borderRadius: "8px",
    padding: "10px 14px",
    fontWeight: 700,
  },
  logoutButton: {
    background: "#4f7f7c",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default LoggedInHome;
