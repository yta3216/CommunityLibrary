import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import avatar_placeholder from "../../resources/avatar_placeholder.png";
import { registerUser } from "../../api/auth";
import "./RegisterAndLogin.css";

const USERNAME_REGEX = /^[A-Za-z0-9]{3,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 5;

export default function Register() {
  const navigate = useNavigate();
  const imageInputRef = useRef(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isValidImageValue = (value) => {
    try {
      const trimmedValue = value.trim();

      if (trimmedValue.startsWith("data:image/")) {
        return true;
      }

      const parsedUrl = new URL(trimmedValue);
      return ["http:", "https:"].includes(parsedUrl.protocol);
    } catch (_error) {
      return false;
    }
  };

  const readFileAsDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Could not read image file."));
      reader.readAsDataURL(file);
    });
  };

  const applySelectedFile = async (file) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Image must be 2MB or smaller.");
      return;
    }

    try {
      setErrorMessage("");
      const dataUrl = await readFileAsDataUrl(file);
      setProfileImageUrl(dataUrl);
    } catch (_error) {
      setErrorMessage("Could not load the selected image.");
    }
  };

  const handleImageInputChange = async (event) => {
    const file = event.target.files?.[0];
    await applySelectedFile(file);
    event.target.value = "";
  };

  const handleImageDrop = async (event) => {
    event.preventDefault();
    setIsImageDragging(false);
    const file = event.dataTransfer.files?.[0];
    await applySelectedFile(file);
  };

  const triggerImagePicker = () => {
    imageInputRef.current?.click();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (
      !username ||
      !email ||
      !password ||
      !confirmPassword ||
      !profileImageUrl
    ) {
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

    if (!isValidImageValue(profileImageUrl)) {
      setErrorMessage("Please choose a valid image file.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser({
        username: normalizedUsername,
        email: normalizedEmail,
        password,
        profileImageUrl: profileImageUrl.trim(),
      });
      setSuccessMessage("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 900);
    } catch (_error) {
      const detail = _error?.data?.detail ? ` (${_error.data.detail})` : "";
      setErrorMessage((_error?.message || "Failed to register.") + detail);
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

          <div
            className={`image-dropzone ${isImageDragging ? "dragging" : ""}`}
            role="button"
            tabIndex={0}
            onClick={triggerImagePicker}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                triggerImagePicker();
              }
            }}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsImageDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsImageDragging(true);
            }}
            onDragLeave={() => setIsImageDragging(false)}
            onDrop={handleImageDrop}
          >
            <img
              src={profileImageUrl.trim() || avatar_placeholder}
              alt="Profile preview"
              className="register-preview-image"
            />
            <p className="image-dropzone-text">
              Click to choose an image or drag and drop it here
            </p>
            <p className="image-dropzone-hint">PNG, JPG, GIF. Up to 2MB.</p>
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden-file-input"
            onChange={handleImageInputChange}
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
