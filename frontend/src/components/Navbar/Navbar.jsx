import React from "react";
import logo from "../../resources/logo.png";
import avatar_placeholder from "../../resources/avatar_placeholder.png";
import "./Navbar.css";

function Navbar({ isLoggedIn = false, searchValue = "", onSearchChange }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} className="logo" alt="logo" />
      </div>

      <div className="navbar-center">
        {/*
          Search value is owned by the page UnregisteredHome as of now
          Typing here calls back to the page so it can filter loaded books no new apis or anything fancy needed to add search function 
        */}
        <input
          type="text"
          placeholder="Search for a book"
          className="search"
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
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
