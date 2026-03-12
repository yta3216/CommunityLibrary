import React, { useState } from 'react';
import logo from "../../resources/logo.png";
import avatar_placeholder from "../../resources/avatar_placeholder.png";
import './Navbar.css';

function Navbar({ isLoggedIn }) {

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <a href={isLoggedIn ? "/home" : "/"} className="nav-link">
          <img src={logo} className="logo" alt="logo" />
        </a>
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
            <a href="/login" className="nav-link">Login</a>
            <a href="/register" className="nav-link signup-btn">Sign Up</a>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
