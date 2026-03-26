import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import avatar_placeholder from "../resources/avatar_placeholder.png";
import "./EditProfile.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5050";

//validation consts... the same as backend. only adding this because it is a requirement
const USERNAME_REGEX = /^[A-Za-z0-9]{3,20}$/;
const DESCRIPTION_MAX_LENGTH = 300;

const EditProfile = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const loadProfile = async () => {
      try {
        setErrorMessage("");
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }

        const user = await response.json();
        if (!isMounted) {
          return;
        }

        setUsername(user.username || "");
        setDescription(user.description || "");
      } catch (_error) {
        if (isMounted) {
          setErrorMessage("Could not load your profile.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const trimmedUsername = username.trim();
    const trimmedDescription = description.trim();

    if (!trimmedUsername) {
      setErrorMessage("Username is required.");
      return;
    }

    if (!USERNAME_REGEX.test(trimmedUsername)) {
      setErrorMessage("Username must be 3-20 letters or numbers.");
      return;
    }

    if (trimmedDescription.length > DESCRIPTION_MAX_LENGTH) {
      setErrorMessage(
        `Description can be up to ${DESCRIPTION_MAX_LENGTH} characters only.`,
      );
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: trimmedUsername,
          description: trimmedDescription,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || "Failed to update profile.");
        return;
      }

      setUsername(result.username || trimmedUsername);
      setDescription(result.description || "");
      setSuccessMessage("Profile updated successfully.");
      setTimeout(() => navigate("/profile"), 700);
    } catch (_error) {
      setErrorMessage("Could not update your profile right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar isLoggedIn={true} />
      <div className="edit-profile-container">
        <h1>Edit Profile</h1>
        <form className="edit-profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Profile Picture</label>
            <img
              src={avatar_placeholder}
              alt="Profile"
              className="profile-pic-large"
            />
            <p className="helper-text">
              Profile picture support will be added later.
            </p>
          </div>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              pattern="[A-Za-z0-9]{3,20}"
              disabled={isLoading || isSubmitting}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              maxLength={DESCRIPTION_MAX_LENGTH}
              placeholder="Tell other users a little about yourself"
              disabled={isLoading || isSubmitting}
            />
          </div>
          <p className="helper-text">For password changes, contact admin.</p>
          {errorMessage ? (
            <p className="form-message error">{errorMessage}</p>
          ) : null}
          {successMessage ? (
            <p className="form-message success">{successMessage}</p>
          ) : null}
          <button type="submit" className="btn">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </>
  );
};

export default EditProfile;
