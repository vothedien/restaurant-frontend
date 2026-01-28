// src/auth/AuthGate.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { hasRole, isLoggedIn } from "./authStore";

export default function AuthGate({ allowedRoles = [], children }) {
  const loc = useLocation();

  // chưa login -> đá về login
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  // sai role -> chặn
  if (!hasRole(allowedRoles)) {
    return (
      <div style={{ padding: 16, fontWeight: 800, color: "#991b1b" }}>
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  return <>{children}</>;
}
