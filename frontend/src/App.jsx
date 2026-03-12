import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import UnregisteredHome from "./pages/UnregisteredHome";
import RegisteredHome from "./pages/RegisteredHome";
import Login from "./components/Form/Login";
import Register from "./components/Form/Register";
import AdminHome from "./components/adminHome";
import AdminBooks from "./components/adminBooks";
import AdminUsers from "./components/adminUsers";
import BookDetail from "./pages/BookDetail";
import MyMessages from "./pages/myMessages";

function App() {
  return (
    <Router>
      <Routes>
        {/*Public pages - unregistered users*/}
        <Route path="/" element={<UnregisteredHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/*Registered users pages*/}
        <Route path="/home" element={<RegisteredHome />} />
        <Route path="/book" element={<BookDetail />} />
        <Route path="/messages" element={<MyMessages />} />

        {/*Admin Pages*/}
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/books" element={<AdminBooks />} />
        <Route path="/admin/users" element={<AdminUsers />} />

        {/*Redirect for undefined routes*/}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
