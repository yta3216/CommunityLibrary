import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";
// logout handler... same as profile page logout
const Sidebar = ({ isLoggedIn }) => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.assign("/");
  };

  return (
    <div className="sidebar">
      {isLoggedIn ? (
        //Registered User View
        <>
          <ul>
            <li>
              <Link to="/home">Home</Link>
            </li>
            <li>
              <Link to="/profile">My Books</Link>
            </li>
            <li>
              <Link to="/messages">Messages</Link>
            </li>
            <li>
              <Link to="/profile/edit">Settings</Link>
            </li>
            <li>
              <Link to="/" onClick={handleLogout}>
                Logout
              </Link>
            </li>
          </ul>
        </>
      ) : (
        //Unregistered User View
        <>
          <ul>
            <li>
              <Link to="/login">Login to access all features</Link>
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

export default Sidebar;
