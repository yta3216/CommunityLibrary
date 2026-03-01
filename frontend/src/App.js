import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./components/login";
import Register from "./components/register";
import AdminHome from "./components/adminHome";
import AdminBooks from "./components/adminBooks";
import AdminUsers from "./components/adminUsers";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/books" element={<AdminBooks />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
