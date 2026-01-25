import { useState } from "react";
import { loadAuth, loginWithBasicAuth, logout } from "./authStore";
import { getErrMsg } from "../utils/httpError";

export default function AuthGate({ allowedRoles, title, children }) {
  const existing = loadAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roleHint, setRoleHint] = useState(allowedRoles?.[0] || "ADMIN");
  const [msg, setMsg] = useState("");

  const hasAuth = !!existing?.username;

  async function onLogin() {
    setMsg("");
    if (!username.trim() || !password) return setMsg("Nhập username/password.");

    try {
      await loginWithBasicAuth(username.trim(), password, roleHint);

      // Option: check allowedRoles theo roleHint (FE)
      if (allowedRoles?.length && !allowedRoles.includes(roleHint)) {
        // Nếu roleHint không đúng trang
        logout();
        return setMsg("Role không hợp lệ cho trang này.");
      }

      window.location.reload();
    } catch (e) {
      setMsg("Sai tài khoản hoặc mật khẩu (BE trả 401). " + getErrMsg(e));
    }
  }

  if (!hasAuth) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border bg-white p-5">
        <div className="text-lg font-semibold">{title || "Đăng nhập"}</div>

        <div className="mt-3 grid gap-2 text-sm">
          <label className="grid gap-1">
            <span className="text-slate-600">Username</span>
            <input className="rounded-xl border px-3 py-2" value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>

          <label className="grid gap-1">
            <span className="text-slate-600">Password</span>
            <input className="rounded-xl border px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          <label className="grid gap-1">
            <span className="text-slate-600">Role (dev)</span>
            <select className="rounded-xl border px-3 py-2" value={roleHint} onChange={(e) => setRoleHint(e.target.value)}>
              <option value="ADMIN">ADMIN</option>
              <option value="WAITER">WAITER</option>
              <option value="CASHIER">CASHIER</option>
            </select>
          </label>

          {msg && <div className="text-red-600">{msg}</div>}

          <button onClick={onLogin} className="mt-2 rounded-xl bg-black px-4 py-2 text-white">
            Login
          </button>

          <div className="mt-2 text-xs text-slate-500">
            Dev: admin/admin123, waiter/waiter123, cashier/cashier123
          </div>
        </div>
      </div>
    );
  }

  return children;
}
