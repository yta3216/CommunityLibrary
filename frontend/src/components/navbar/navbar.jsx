import React, { useState } from 'react';
import logo from "../../resources/logo.png";
import avatar_placeholder from "../../resources/avatar_placeholder.png";
import './navbar.css';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} className="logo" alt="logo" />
      </div>

      <div className="navbar-center">
        {/* REPLACE LATER WHEN SEARCH BAR IS CREATED */}
        <input 
          type="text" 
          placeholder="Search for a book" 
          className="search"
        />
      </div>

      <div className="navbar-right">
        {isLoggedIn ? (
          <>
            <a href="/" className="nav-link">Home</a>
            <a href="/library" className="nav-link">My Library</a>
            <a href="/community" className="nav-link">Community</a>
            <img 
              src={avatar_placeholder}
              alt="Profile" 
              className="profile-pic"
            />
          </>
        ) : (
          <>
            <a href="/login" className="nav-link">Login</a>
            <a href="/signup" className="nav-link signup-btn">Sign Up</a>
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
