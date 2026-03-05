import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/UnregisteredHome";
import { Navigate } from "react-router-dom";
import Login from "./components/Form/login";
import Register from "./components/Form/register";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
