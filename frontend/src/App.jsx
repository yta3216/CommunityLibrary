import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import UnregisteredHome from "./pages/UnregisteredHome";
import Login from "./components/Form/Login";
import Register from "./components/Form/Register";

import LoggedInHome from "./pages/LoggedInHome";
import BookDetail from "./pages/BookDetail";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import MyMessages from "./pages/myMessages";
import Categories from "./pages/Categories";

import AdminHome from "./components/adminHome";
import AdminBooks from "./components/adminBooks";
import AdminUsers from "./components/adminUsers";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5050";

const getHomeRouteForRole = (role) => {
  return role === "admin" ? "/admin/home" : "/home";
};

const RequireAuth = ({ children, isAuthLoading, isAuthenticated }) => {
  if (isAuthLoading) {
    return null;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicOnly = ({ children, isAuthLoading, isAuthenticated, userRole }) => {
  if (isAuthLoading) {
    return null;
  }

  return isAuthenticated ? (
    <Navigate to={getHomeRouteForRole(userRole)} replace />
  ) : (
    children
  );
};

const RequireAdmin = ({
  children,
  isAuthLoading,
  isAuthenticated,
  userRole,
}) => {
  if (isAuthLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return userRole === "admin" ? children : <Navigate to="/home" replace />;
};

function App() {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuthLoading(false);
      return;
    }

    const bootstrapSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Invalid session");
        }

        const currentUser = await response.json();
        if (!isMounted) {
          return;
        }

        setUser(currentUser);
      } catch (_error) {
        localStorage.removeItem("token");
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);
  const userRole = user?.role;

  if (isAuthLoading) {
    return null;
  }

  return (
    <Router>
      <Routes>
        {/* Public pages - unregistered users */}
        <Route
          path="/"
          element={
            <PublicOnly
              isAuthLoading={isAuthLoading}
              isAuthenticated={isAuthenticated}
              userRole={userRole}
            >
              <UnregisteredHome />
            </PublicOnly>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnly
              isAuthLoading={isAuthLoading}
              isAuthenticated={isAuthenticated}
              userRole={userRole}
            >
              <Login />
            </PublicOnly>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnly
              isAuthLoading={isAuthLoading}
              isAuthenticated={isAuthenticated}
              userRole={userRole}
            >
              <Register />
            </PublicOnly>
          }
        />

        {/* Registered users pages */}
        <Route
          path="/home"
          element={
            <RequireAuth
              isAuthLoading={isAuthLoading}
              isAuthenticated={isAuthenticated}
            >
              <LoggedInHome />
            </RequireAuth>
          }
        />
        <Route
          path="/book"
          element={
            <RequireAuth
              isAuthLoading={isAuthLoading}
              isAuthenticated={isAuthenticated}
            >
              <BookDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth
              isAuthLoading={isAuthLoading}
              isAuthenticated={isAuthenticated}
            >
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <RequireAuth
              isAuthLoading={isAuthLoading}
              isAuthenticated={isAuthenticated}
            >
              <EditProfile />
            </RequireAuth>
          }
        />
        <Route
          path="/messages"
          element={
            <RequireAuth
              isAuthLoading={isAuthLoading}
              isAuthenticated={isAuthenticated}
            >
              <MyMessages />
            </RequireAuth>
          }
        />
        <Route
          path="/categories"
          element={
            <RequireAuth
              isAuthLoading={isAuthLoading}
              isAuthenticated={isAuthenticated}
            >
              <Categories />
            </RequireAuth>
          }
        />

        {/* Admin Pages */}
        <Route
          path="/admin/home"
          element={
            <RequireAdmin
              isAuthLoading={isAuthLoading}
              isAuthenticated={isAuthenticated}
              userRole={userRole}
            >
              <AdminHome />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/books"
          element={
            <RequireAdmin
              isAuthLoading={isAuthLoading}
              isAuthenticated={isAuthenticated}
              userRole={userRole}
            >
              <AdminBooks />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAdmin
              isAuthLoading={isAuthLoading}
              isAuthenticated={isAuthenticated}
              userRole={userRole}
            >
              <AdminUsers />
            </RequireAdmin>
          }
        />

        {/* Redirect for undefined routes */}
        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? getHomeRouteForRole(userRole) : "/"}
              replace
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
