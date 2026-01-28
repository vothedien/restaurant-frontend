import { NavLink, useNavigate } from "react-router-dom";
import { clearAuth, getAuth, isLoggedIn } from "../../auth/authStore";

function Tab({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "rounded-xl px-3 py-1.5 text-sm",
          isActive ? "bg-black text-white" : "hover:bg-slate-100",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export default function Topbar() {
  const nav = useNavigate();
  const auth = getAuth();

  const logged = isLoggedIn();
  const roles = auth?.roles || [];

  return (
    <div className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-black px-3 py-1.5 text-sm font-semibold text-white">
            Restaurant
          </div>
          <div className="flex items-center gap-1">
            <Tab to="/customer" label="Customer" />
            <Tab to="/waiter" label="Waiter" />
            <Tab to="/cashier" label="Cashier" />
            <Tab to="/admin" label="Admin" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {logged ? (
            <>
              <div className="hidden md:block text-xs text-slate-600">
                <span className="font-medium">{auth.username}</span>{" "}
                <span className="text-slate-400">•</span>{" "}
                {roles.join(", ")}
              </div>
              <button
                className="rounded-xl border px-3 py-1.5 text-sm hover:bg-slate-50"
                onClick={() => {
                  clearAuth();
                  nav("/login", { replace: true });
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="rounded-xl bg-black px-3 py-1.5 text-sm text-white"
              onClick={() => nav("/login")}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
