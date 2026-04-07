import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import avatar_placeholder from "../../resources/avatar_placeholder.png";
import { useAuth } from "../../context/AuthContext";
import { updateCurrentUser } from "../../api/users";
import "./EditProfile.css";
import Sidebar from "../../components/Sidebar/Sidebar";

//validation consts... the same as backend. only adding this because it is a requirement
const USERNAME_REGEX = /^[A-Za-z0-9]{3,20}$/;
const DESCRIPTION_MAX_LENGTH = 300;

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const imageInputRef = useRef(null);
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setUsername(user?.username || "");
    setDescription(user?.description || "");
    setProfileImageUrl(user?.profileImageUrl || "");
    setIsLoading(false);
  }, [user]);

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

    if (profileImageUrl && !isValidImageValue(profileImageUrl)) {
      setErrorMessage("Please choose a valid image file.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateCurrentUser({
        username: trimmedUsername,
        description: trimmedDescription,
        profileImageUrl: profileImageUrl.trim(),
      });

      setUsername(result.username || trimmedUsername);
      setDescription(result.description || "");
      setProfileImageUrl(result.profileImageUrl || profileImageUrl.trim());
      setSuccessMessage("Profile updated successfully.");
      updateUser(result);
      setTimeout(() => navigate("/profile"), 700);
    } catch (_error) {
      setErrorMessage(
        _error?.message || "Could not update your profile right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="sidebar-layout">
        <Sidebar />
        <div className="content">
          <Breadcrumbs
            items={[
              { label: "Home", to: "/home" },
              { label: "Profile", to: "/profile" },
              { label: "Edit Profile" },
            ]}
          />
          <div className="edit-profile-container">
            <h1>Edit Profile</h1>
            <form className="edit-profile-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Profile Picture</label>
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
                    alt="Profile"
                    className="profile-pic-large"
                  />
                  <p className="image-dropzone-text">
                    Click to choose an image or drag and drop it here
                  </p>
                  <p className="image-dropzone-hint">
                    PNG, JPG, GIF. Up to 2MB.
                  </p>
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden-file-input"
                  onChange={handleImageInputChange}
                  disabled={isLoading || isSubmitting}
                />
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
              <p className="helper-text">
                For password changes, contact admin.
              </p>
              {errorMessage ? (
                <p className="form-message error">{errorMessage}</p>
              ) : null}
              {successMessage ? (
                <p className="form-message success">{successMessage}</p>
              ) : null}
              <button type="submit" className="button-primary">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
