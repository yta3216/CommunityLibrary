import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import avatar_placeholder from "../../resources/avatar_placeholder.png";
import Navbar from "../../components/Navbar/Navbar";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import avatar_placeholder from "../../resources/avatar_placeholder.png";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    window.location.assign("/");
  };

  return (
    <>
      <Navbar
        onSearchClick={() => navigate("/home")}
        onSearchFocus={() => navigate("/home")}
      />
      <div className="sidebar-layout">
        <Sidebar />
        <div className="content">
          <Breadcrumbs
            items={[{ label: "Home", to: "/home" }, { label: "Profile" }]}
          />
          <div className="profile-container">
            <section className="profile-info">
              <div>
                <h1>Your Profile</h1>
                <p className="heading-md">{user?.username || "Could not load username"}</p>
                <p className="text-muted-sm">{user?.email || "Could not load email"}</p>
                <p className="text-muted-sm">{user?.description || "Add a profile description."}</p>
              </div>
              <div className="profile-meta">
                <img
                  src={user?.profileImageUrl || avatar_placeholder}
                  alt="Profile"
                  className="profile-pic-large"
                />
                <p className="text-muted-xs status-badge">
                  Status: {user?.status || "active"}
                </p>
              </div>
            </section>

            <div className="profile-actions">
              <Link to="/messages" className="button-secondary">
                My Messages
              </Link>
              <Link to="/profile/edit" className="button-secondary">
                Edit Profile
              </Link>
              <button
                type="button"
                className="button-danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
