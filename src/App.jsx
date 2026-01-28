// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import AuthGate from "./auth/AuthGate.jsx";

import CustomerPage from "./pages/Customer/CustomerPage.jsx";
import WaiterPage from "./pages/Waiter/WaiterPage.jsx";
import CashierPage from "./pages/Cashier/CashierPage.jsx";
import AdminPage from "./pages/Admin/AdminPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/customer" replace />} />

      {/* Customer (QR) */}
      <Route path="/customer" element={<CustomerPage />} />
      <Route path="/customer/:token" element={<CustomerPage />} />

      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Staff pages (require role) */}
      <Route
        path="/waiter"
        element={
          <AuthGate title="Waiter Login" allowedRoles={["ROLE_WAITER", "ROLE_ADMIN"]}>
            <WaiterPage />
          </AuthGate>
        }
      />

      <Route
        path="/cashier"
        element={
          <AuthGate title="Cashier Login" allowedRoles={["ROLE_CASHIER", "ROLE_ADMIN"]}>
            <CashierPage />
          </AuthGate>
        }
      />

      <Route
        path="/admin"
        element={
          <AuthGate title="Admin Login" allowedRoles={["ROLE_ADMIN"]}>
            <AdminPage />
          </AuthGate>
        }
      />

      <Route path="*" element={<div className="p-6">404</div>} />
    </Routes>
  );
}
