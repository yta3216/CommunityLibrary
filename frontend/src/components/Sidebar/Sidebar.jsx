import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const Sidebar = () => {
  const { signOut, isAuthenticated, user } = useAuth();

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="sidebar">
      {isAuthenticated ? (
        //Registered User View
        <>
          <ul>
            <li>
              <Link to="/home">Home</Link>
            </li>
            <li>
              <Link to="/categories">Categories</Link>
            </li>
            <li>
              <Link to="/library">My Library</Link>
            </li>
            <li>
              <Link to="/messages">Messages</Link>
            </li>
            {user.role === "admin" && (
              <li>
                <Link to="/admin/home">Admin Dashboard</Link>
              </li>
            )}
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