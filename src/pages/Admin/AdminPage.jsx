import { useState } from "react";
import AuthGate from "../../auth/AuthGate.jsx";
import { logout, loadAuth } from "../../auth/authStore.js";
import TablesTab from "./TablesTab.jsx";
import MenuTab from "./MenuTab.jsx";
import TransactionsTab from "./TransactionsTab.jsx";

export default function AdminPage() {
  return (
    <AuthGate allowedRoles={["ADMIN"]} title="Admin Login (Basic Auth)">
      <AdminInner />
    </AuthGate>
  );
}

function AdminInner() {
  const [tab, setTab] = useState("tables"); // tables | menu | transactions
  const a = loadAuth();

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Admin Dashboard</div>
            <div className="mt-1 text-xs text-slate-500">
              Logged as <b>{a?.username}</b> ({a?.roleHint || "ADMIN"})
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tab active={tab === "tables"} onClick={() => setTab("tables")}>
              Tables
            </Tab>
            <Tab active={tab === "menu"} onClick={() => setTab("menu")}>
              Menu
            </Tab>
            <Tab active={tab === "transactions"} onClick={() => setTab("transactions")}>
              Transactions
            </Tab>

            <button
              onClick={() => {
                logout();
                window.location.href = "/admin";
              }}
              className="rounded-xl bg-rose-600 px-3 py-2 text-sm text-white"
              title="Đăng xuất"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        <div className="mt-2 text-xs text-slate-500">
          Form tạo bàn / tạo món nằm dưới. Bấm nút “Tạo …” để hiện form.
        </div>
      </div>

      {/* Tabs */}
      {tab === "tables" && <TablesTab />}
      {tab === "menu" && <MenuTab />}
      {tab === "transactions" && <TransactionsTab />}
    </div>
  );
}

function Tab({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={[
        "rounded-xl px-3 py-2 border text-sm",
        active ? "bg-black text-white border-black" : "bg-white hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
