import { Navigate } from "react-router-dom";
import { loadAuth } from "./authStore";

export default function RequireRole({ allowedRoles = [], children }) {
  const a = loadAuth();

  if (!a?.username) return <Navigate to="/admin" replace />;

  if (allowedRoles.length) {
    const roles = a?.roles || [];
    const ok = allowedRoles.some((r) => roles.includes(r));
    if (!ok) return <Navigate to="/" replace />;
  }

  return children;
}
