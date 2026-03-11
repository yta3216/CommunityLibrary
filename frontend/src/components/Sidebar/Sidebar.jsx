import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({isLoggedIn}) => {
  return (
    <div className="sidebar">
      {isLoggedIn? (
        //Registered User View
        <>
          <ul>
            <li>
              <a href="/Home">Home</a>
            </li>
            <li>
              <a href="/library">My Library</a>
            </li>
            <li>
              <a href="/community">Community</a>
            </li>
            <li>
              <a href="/settings">Settings</a>
            </li>
            <li>
              <a href ="/logout">Logout</a>
            </li>
          </ul>
        </>
      ) : (
        //Unregistered User View
        <>
          <ul>
            <li>
              <a href="/login">Home</a>
            </li>
            <li>
              <a href="/login">Books</a>
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

export default Sidebar;
