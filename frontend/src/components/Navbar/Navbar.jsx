import { useEffect, useState } from "react";
import logo from "../../resources/logo.png";
import avatar_placeholder from "../../resources/avatar_placeholder.png";
import "./Navbar.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5050";

function Navbar({ isLoggedIn, searchValue = "", onSearchChange }) {
  const [profileImageUrl, setProfileImageUrl] = useState(avatar_placeholder);

  const searchInputProps = onSearchChange
    ? {
        value: searchValue,
        onChange: (event) => onSearchChange(event.target.value),
      }
    : {
        defaultValue: searchValue,
      };

  useEffect(() => {
    let isMounted = true;

    if (!isLoggedIn) {
      setProfileImageUrl(avatar_placeholder);
      return undefined;
    }

    const loadProfileImage = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (isMounted) {
          setProfileImageUrl(avatar_placeholder);
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load profile image");
        }

        const user = await response.json();
        if (isMounted) {
          setProfileImageUrl(user.profileImageUrl || avatar_placeholder);
        }
      } catch (_error) {
        if (isMounted) {
          setProfileImageUrl(avatar_placeholder);
        }
      }
    };

    loadProfileImage();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <a href={isLoggedIn ? "/home" : "/"} className="nav-link">
          <img src={logo} className="logo" alt="logo" />
        </a>
      </div>

      <div className="navbar-center">
        {/*
          Search input is controlled by each page.
          The page owns the search state and sends value + change handler here.
        */}
        <input
          type="text"
          placeholder="Search for a book"
          className="search"
          {...searchInputProps}
        />
      </div>

      <div className="navbar-right">
        {isLoggedIn ? (
          //Registered User View
          <>
            <a href="/profile" className="nav-link">
              <img
                src={profileImageUrl}
                alt="Profile"
                className="profile-pic"
              />
            </a>
          </>
        ) : (
          //Unregistered User View
          <>
            <a href="/login" className="nav-link">
              Login
            </a>
            <a href="/register" className="nav-link signup-btn">
              Sign Up
            </a>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
