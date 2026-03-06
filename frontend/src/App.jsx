import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/UnregisteredHome";
import { Navigate } from "react-router-dom";
import Login from "./components/Form/Login";
import Register from "./components/Form/Register";
import AdminHome from "./components/adminHome";
import AdminBooks from "./components/adminBooks";
import AdminUsers from "./components/adminUsers";
import LoggedInHome from "./pages/LoggedInHome";

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <LoggedInHome />
            </RequireAuth>
          }
        />
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/books" element={<AdminBooks />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
