import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./RegisterAndLogin.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5050";

const getHomeRouteForRole = (role) => {
  return role === "admin" ? "/admin/home" : "/home";
};

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRobotChecked, setIsRobotChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");

    const form = event.currentTarget;
    const identifierValue = (
      form.elements.username?.value ||
      username ||
      ""
    ).trim();
    const passwordValue = form.elements.password?.value || password || "";

    if (!identifierValue || !passwordValue) {
      setErrorMessage("Please enter your email/username and password.");
      return;
    }

    if (!isRobotChecked) {
      setErrorMessage("Please confirm you are not a robot.");
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedId = identifierValue;
      const maybeEmail = normalizedId.includes("@") ? normalizedId : "";

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: normalizedId,
          email: maybeEmail,
          username: normalizedId,
          password: passwordValue,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const detail = result.detail ? ` (${result.detail})` : "";
        setErrorMessage((result.message || "Failed to login.") + detail);
        return;
      }

      localStorage.setItem("token", result.token);
      const targetRoute = getHomeRouteForRole(result?.user?.role);

      // force a hard navigation so App auth bootstrap re-runs with the new token
      window.location.assign(targetRoute);
    } catch (_error) {
      setErrorMessage("Could not reach server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="book-icon" aria-hidden="true"></div>
        <h1 className="login-title">Login</h1>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="username" className="input-label">
            Email or Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter your email or username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="text-input"
          />

          <label htmlFor="password" className="input-label">
            Password
          </label>
          <div className="password-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="text-input password-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="eye-button"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <label className="robot-label">
            <input
              type="checkbox"
              checked={isRobotChecked}
              onChange={(event) => setIsRobotChecked(event.target.checked)}
            />
            <span>Are you not a robot?</span>
          </label>

          <div className="button-row">
            <button
              type="submit"
              className="action-button login-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        {errorMessage ? (
          <p className="status-message error">{errorMessage}</p>
        ) : null}

        <p className="footer-text">
          Don’t have an account?{" "}
          <Link to="/register" className="link-button">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
