import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./RegisterAndLogin.css";

//validation consts... the same as backend. only adding this because it is a requirement
const USERNAME_REGEX = /^[A-Za-z0-9]{3,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 5;

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5050";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!username || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill all required fields.");
      return;
    }
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!USERNAME_REGEX.test(normalizedUsername)) {
      setErrorMessage("Username must be 3-20 letters or numbers.");
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setErrorMessage("Please enter a valid email.");
      return;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      setErrorMessage(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: normalizedUsername,
          email: normalizedEmail,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || "Failed to register.");
        return;
      }
      setSuccessMessage("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 900);
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
        <h1 className="login-title">Register</h1>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="register-username" className="input-label">
            Username
          </label>
          <input
            id="register-username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="text-input"
          />

          <label htmlFor="register-email" className="input-label">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="text-input"
          />

          <label htmlFor="register-password" className="input-label">
            Password
          </label>
          <div className="password-wrapper">
            <input
              id="register-password"
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

          <label htmlFor="register-confirm-password" className="input-label">
            Confirm Password
          </label>
          <input
            id="register-confirm-password"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="text-input"
          />

          <div className="button-row">
            <button
              type="submit"
              className="action-button login-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
            <button
              type="button"
              className="action-button login-admin-button"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </button>
          </div>
        </form>

        {errorMessage ? (
          <p className="status-message error">{errorMessage}</p>
        ) : null}
        {successMessage ? (
          <p className="status-message success">{successMessage}</p>
        ) : null}

        <p className="footer-text">
          Already have an account?{" "}
          <Link to="/login" className="link-button">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
