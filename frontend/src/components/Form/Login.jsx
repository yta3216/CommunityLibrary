import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./RegisterAndLogin.css";

//validation consts... the same as backend. only adding this because it is a requirement
const USERNAME_REGEX = /^[A-Za-z0-9]{3,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getHomeRouteForRole = (role) => {
  return role === "admin" ? "/admin/home" : "/home";
};

export default function Login() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRobotChecked, setIsRobotChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // new handler that has the required frontend validation
  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    //user name is the var name but it is either username or email...
    const identifierValue = username.trim();
    const passwordValue = password;

    if (!identifierValue || !passwordValue) {
      setErrorMessage("Please enter your email/username and password.");
      return;
    }

    const isEmailLogin = identifierValue.includes("@");
    if (isEmailLogin && !EMAIL_REGEX.test(identifierValue)) {
      setErrorMessage("Please enter a valid email.");
      return;
    }

    if (!isEmailLogin && !USERNAME_REGEX.test(identifierValue)) {
      setErrorMessage("Username must be 3-20 letters or numbers.");
      return;
    }

    if (passwordValue.length < 5) {
      setErrorMessage("Password must be at least 5 characters.");
      return;
    }

    if (!isRobotChecked) {
      setErrorMessage("Please confirm you are not a robot.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn(identifierValue, passwordValue);
      const targetRoute = getHomeRouteForRole(result?.user?.role);

      // force a hard navigation so App auth bootstrap re-runs with the new token
      window.location.assign(targetRoute);
    } catch (_error) {
      const detail = _error?.data?.detail ? ` (${_error.data.detail})` : "";
      setErrorMessage((_error?.message || "Failed to login.") + detail);
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
