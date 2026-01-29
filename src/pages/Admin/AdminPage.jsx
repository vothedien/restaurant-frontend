import React, { useState } from "react";
import TablesTab from "./TablesTab";
import MenuTab from "./MenuTab";
import TransactionsTab from "./TransactionsTab";
import { LayoutDashboard, Utensils, Receipt, LogOut } from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("tables");

  const renderContent = () => {
    switch (activeTab) {
      case "tables": return <TablesTab />;
      case "menu": return <MenuTab />;
      case "transactions": return <TransactionsTab />;
      default: return <TablesTab />;
    }
  };

  const navItems = [
    { id: "tables", label: "Quản lý Bàn", icon: <LayoutDashboard size={20} /> },
    { id: "menu", label: "Thực đơn & Món", icon: <Utensils size={20} /> },
    { id: "transactions", label: "Lịch sử giao dịch", icon: <Receipt size={20} /> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#fff7ed", fontFamily: "sans-serif" }}>
      {/* Header */}
      <header style={{
        background: "#78350f", color: "white", padding: "15px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 24 }}>🛡️</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: "bold" }}>MỘC QUÁN ADMIN</h1>
            <span style={{ fontSize: 12, opacity: 0.8 }}>Hệ thống quản trị</span>
          </div>
        </div>
        <button onClick={() => window.location.href = '/login'} style={{
          background: "rgba(255,255,255,0.2)", border: "none", color: "white",
          padding: "8px 16px", borderRadius: 8, cursor: "pointer", display: "flex", gap: 8
        }}>
          <LogOut size={18} /> Đăng xuất
        </button>
      </header>

      <div style={{ display: "flex", minHeight: "calc(100vh - 70px)" }}>
        {/* Sidebar Nav */}
        <aside style={{ width: 260, background: "white", borderRight: "1px solid #fed7aa", padding: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", borderRadius: 12,
                  border: "none", cursor: "pointer",
                  textAlign: "left", fontSize: 15, fontWeight: 600,
                  background: activeTab === item.id ? "#fff7ed" : "transparent",
                  color: activeTab === item.id ? "#d97706" : "#57534e",
                  borderLeft: activeTab === item.id ? "4px solid #d97706" : "4px solid transparent"
                }}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: 30 }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}