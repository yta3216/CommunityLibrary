import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";

import UnregisteredHome from "./pages/UnregisteredHome";
import Login from "./components/Form/Login";
import Register from "./components/Form/Register";

import LoggedInHome from "./pages/LoggedInHome";
import BookDetail from "./pages/BookDetail";
import Profile from "./pages/profile/Profile";
import EditProfile from "./pages/profile/EditProfile";
import Messages from "./pages/Messages";

import AdminHome from "./pages/admin/AdminHome";
import AdminBooks from "./pages/admin/AdminBooks";
import AdminUsers from "./pages/admin/AdminUsers";



const getHomeRouteForRole = (role) => {
  return role === "admin" ? "/admin/home" : "/home";
};

const RequireAuth = ({ children }) => {
  const { isAuthLoading, isAuthenticated } = useAuth();

  if (isAuthLoading) {
    return null;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicOnly = ({ children }) => {
  const { isAuthLoading, isAuthenticated, userRole } = useAuth();

  if (isAuthLoading) {
    return null;
  }

  return isAuthenticated ? (
    <Navigate to={getHomeRouteForRole(userRole)} replace />
  ) : (
    children
  );
};

const RequireAdmin = ({ children }) => {
  const { isAuthLoading, isAuthenticated, userRole } = useAuth();

  if (isAuthLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return userRole === "admin" ? children : <Navigate to="/home" replace />;
};

const AppRedirect = () => {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <Navigate
      to={isAuthenticated ? getHomeRouteForRole(userRole) : "/"}
      replace
    />
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
        {/* Public pages - unregistered users */}
        <Route
          path="/"
          element={
            <PublicOnly>
              <UnregisteredHome />
            </PublicOnly>
          }
        />
        <Route
          path="/login"
          element={<PublicOnly><Login /></PublicOnly>}
        />
        <Route
          path="/register"
          element={<PublicOnly><Register /></PublicOnly>}
        />

        {/* Registered users pages */}
        <Route
          path="/home"
          element={<RequireAuth><LoggedInHome /></RequireAuth>}
        />
        <Route
          path="/book"
          element={<RequireAuth><BookDetail /></RequireAuth>}
        />
        <Route
          path="/profile"
          element={<RequireAuth><Profile /></RequireAuth>}
        />
        <Route
          path="/profile/edit"
          element={<RequireAuth><EditProfile /></RequireAuth>}
        />
        <Route
          path="/messages"
          element={<RequireAuth><Messages /></RequireAuth>}
        />

        {/* Admin Pages */}
        <Route
          path="/admin/home"
          element={<RequireAdmin><AdminHome /></RequireAdmin>}
        />
        <Route
          path="/admin/books"
          element={<RequireAdmin><AdminBooks /></RequireAdmin>}
        />
        <Route
          path="/admin/users"
          element={<RequireAdmin><AdminUsers /></RequireAdmin>}
        />

        {/* Redirect for undefined routes */}
        <Route
          path="*"
          element={<AppRedirect />}
        />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
