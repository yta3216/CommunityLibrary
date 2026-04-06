import logo from "../../resources/logo.png";
import { useAuth } from "../../context/AuthContext";
import avatar_placeholder from "../../resources/avatar_placeholder.png";
import "./Navbar.css";

function Navbar({
  searchValue = "",
  onSearchChange,
  onSearchClick,
  onSearchFocus,
}) {
  const { isAuthenticated, user } = useAuth();
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
        <a href={isAuthenticated ? "/home" : "/"} className="nav-link">
          <img src={logo} className="logo" alt="logo" />
        </a>
      </div>

      <div className="navbar-center">
        <input
          type="text"
          placeholder="Search for a book"
          className="search"
          onClick={onSearchClick}
          onFocus={onSearchFocus}
          {...searchInputProps}
        />
      </div>

      <div className="navbar-right">
        {isAuthenticated ? (
          <a href="/profile" className="nav-link">
            <img
              src={user?.profileImageUrl || avatar_placeholder}
              alt="Profile"
              className="profile-pic"
            />
          </a>
        ) : (
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
