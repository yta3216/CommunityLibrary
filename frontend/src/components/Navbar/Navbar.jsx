import React from "react";
import logo from "../../resources/logo.png";
import avatar_placeholder from "../../resources/avatar_placeholder.png";
import "./Navbar.css";

function Navbar({ isLoggedIn, searchValue = "", onSearchChange }) {
  const searchInputProps = onSearchChange
    ? {
        value: searchValue,
        onChange: (event) => onSearchChange(event.target.value),
      }
    : {
        defaultValue: searchValue,
      };

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
                src={avatar_placeholder}
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
