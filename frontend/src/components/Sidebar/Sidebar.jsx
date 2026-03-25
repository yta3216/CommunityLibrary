import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isLoggedIn }) => {
  return (
    <div className="sidebar">
      {isLoggedIn ? (
        //Registered User View
        <>
          <ul>
            <li>
              <a href="/Home">Home</a>
            </li>
            <li>
              <a href="./profile">My Books</a>
            </li>
            <li>
              <a href="./messages">Messages</a>
            </li>
            <li>
              <a href="./profile/edit">Settings</a>
            </li>
            <li>
              <a href="./login">Logout</a>
            </li>
          </ul>
        </>
      ) : (
        //Unregistered User View
        <>
          <ul>
            <li>
              <a href="/login">Login to access all features</a>
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

export default Sidebar;
