import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./RegisterAndLogin.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRobotChecked, setIsRobotChecked] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="book-icon" aria-hidden="true"></div>
        <h1 className="login-title">Login</h1>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="username" className="input-label">
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
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
            <span>Are you a robot?</span>
          </label>

          <div className="button-row">
            <button type="submit" className="action-button login-button">
              Login
            </button>
            <Link
              to="/admin/home"
              className="action-button login-admin-button"
            >
              Login as Admin
            </Link>
          </div>
        </form>

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
