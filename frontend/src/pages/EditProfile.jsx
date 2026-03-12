import Navbar from "../components/Navbar/Navbar";
import avatar_placeholder from "../resources/avatar_placeholder.png";
import "./EditProfile.css";

const EditProfile = () => {
  // placeholder state could be added later
  return (
    <>
      <Navbar isLoggedIn={true} />
      <div className="edit-profile-container">
        <h1>Edit Profile</h1>
        <form className="edit-profile-form" action="/profile">
          <div className="form-group">
            <label>Profile Picture</label>
            <img
              src={avatar_placeholder}
              alt="Profile"
              className="profile-pic-large"
            />
            <input type="file" name="picture" />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input type="text" defaultValue="user123" />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" />
          </div>
          <button type="submit" className="btn">
            Save Changes
          </button>
        </form>
      </div>
    </>
  );
};

export default EditProfile;