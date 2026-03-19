import React, { useState } from "react";
import logo from "../../resources/logo.png";
import avatar_placeholder from "../../resources/avatar_placeholder.png";
import "./Navbar.css";

function Navbar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search for a book",
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} className="logo" alt="logo" />
      </div>

      <div className="navbar-center">
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="search"
          value={searchValue}
          onChange={(event) => {
            if (onSearchChange) {
              onSearchChange(event.target.value);
            }
          }}
        />
      </div>

      <div className="navbar-right">
        {isLoggedIn ? (
          <>
            <a href="/" className="nav-link">
              Home
            </a>
            <a href="/library" className="nav-link">
              My Library
            </a>
            <a href="/community" className="nav-link">
              Community
            </a>
            <img
              src={avatar_placeholder}
              alt="Profile"
              className="profile-pic"
            />
          </>
        ) : (
          <>
            <a href="/login" className="nav-link">
              Login
            </a>
            <a href="/register" className="nav-link signup-btn">
              Sign Up
            </a>
            <img
              src={avatar_placeholder}
              alt="Profile"
              className="profile-pic"
            />
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
