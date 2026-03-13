import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import UnregisteredHome from "./pages/UnregisteredHome";
import Login from "./components/Form/Login";
import Register from "./components/Form/Register";

import LoggedInHome from "./pages/LoggedInHome";
import BookDetail from "./pages/BookDetail";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import MyMessages from "./pages/myMessages";

import AdminHome from "./components/adminHome";
import AdminBooks from "./components/adminBooks";
import AdminUsers from "./components/adminUsers";

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public pages - unregistered users */}
        <Route path="/" element={<UnregisteredHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Registered users pages */}
        <Route
          path="/home"
          element={
            <RequireAuth>
              <LoggedInHome />
            </RequireAuth>
          }
        />
        <Route
          path="/book"
          element={
            <RequireAuth>
              <BookDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <RequireAuth>
              <EditProfile />
            </RequireAuth>
          }
        />
        <Route
          path="/messages"
          element={
            <RequireAuth>
              <MyMessages />
            </RequireAuth>
          }
        />

        {/* Admin Pages */}
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/books" element={<AdminBooks />} />
        <Route path="/admin/users" element={<AdminUsers />} />

        {/* Redirect for undefined routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;