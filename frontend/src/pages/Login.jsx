import React from "react";
import Login from "../components/login";
import Sidebar from "../components/sidebar/sidebar";

const LoginPage = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "20px", padding: "20px" }}>
        <Login />
      </div>
    </div>
  );
};

export default LoginPage;
