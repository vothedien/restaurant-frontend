import { useState } from "react";
import TablesTab from "./TablesTab";
import MenuTab from "./MenuTab";
import TransactionsTab from "./TransactionsTab";
import { ChefHat, ShieldCheck } from "lucide-react";

export default function AdminPage() {
  const [tab, setTab] = useState("tables"); // tables | menu | transactions

  return (
    <div className="staffPage">
      <header className="staffHeader">
        <div className="staffHeaderInner">
          <div className="staffBrand">
            <div className="brandIcon">
              <ChefHat size={22} color="#78350f" />
            </div>
            <div>
              <h1 className="staffBrandTitle">Mộc Quán</h1>
              <p className="staffBrandSub">QUẢN TRỊ HỆ THỐNG</p>
            </div>
          </div>

          <div className="staffRolePill">
            <span className="staffRoleDot" />
            <ShieldCheck size={16} />
            ADMIN
          </div>
        </div>
        <div className="headerLine" />
      </header>

      <main className="staffMain">
        {/* Top tabs */}
        <div className="staffCard">
          <div className="staffCardTitle" style={{ marginBottom: 10 }}>
            <h2>Dashboard</h2>
            <div className="staffCardHint">Quản lý bàn / menu / giao dịch</div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <TabBtn active={tab === "tables"} onClick={() => setTab("tables")}>
              Tables
            </TabBtn>
            <TabBtn active={tab === "menu"} onClick={() => setTab("menu")}>
              Menu
            </TabBtn>
            <TabBtn
              active={tab === "transactions"}
              onClick={() => setTab("transactions")}
            >
              Transactions
            </TabBtn>
          </div>
        </div>

        {/* Content */}
        <div className="staffCard">
          {tab === "tables" && <TablesTab />}
          {tab === "menu" && <MenuTab />}
          {tab === "transactions" && <TransactionsTab />}
        </div>
      </main>
    </div>
  );
}

function TabBtn({ active, children, ...props }) {
  return (
    <button
      {...props}
      type="button"
      className={active ? "staffBtn" : "staffBtnGhost"}
      style={{
        borderRadius: 999,
        padding: "10px 14px",
        boxShadow: active ? "0 14px 30px rgba(249,115,22,0.20)" : undefined,
      }}
    >
      {children}
    </button>
  );
}
