import React from "react";
import Login from "../components/Login";

const LoginPage = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "20px", padding: "20px" }}>
        <Login />
        <Link to="/">Home</Link>
      </div>
    </div>
  );
};

export default LoginPage;
