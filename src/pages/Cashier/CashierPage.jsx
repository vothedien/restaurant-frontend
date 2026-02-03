import { useEffect, useState, useCallback } from "react";
import { getTables } from "../../api/cashier.api";
import TableCard from "../Waiter/components/TableCard";
import BillPanel from "./components/BillPanel";

export default function CashierPage() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);

  const loadTables = useCallback(async () => {
    try {
      const data = await getTables();
      setTables(data);

      if (selectedTable) {
        const updated = data.find((t) => t.id === selectedTable.id);
        setSelectedTable(updated || null);
      }
    } catch (error) {
      console.error("Lỗi tải sơ đồ bàn:", error);
    }
  }, [selectedTable]);

  useEffect(() => {
    loadTables();
    const interval = setInterval(loadTables, 8000);
    return () => clearInterval(interval);
  }, []);

  const requestingCount = tables.filter((t) => t.status === "REQUESTING_BILL").length;

  return (
    <div className="customerPage">
      <header className="customerHeader">
        <div className="customerHeaderInner">
          <div className="brandLeft">
            <div className="brandIcon">💰</div>
            <h1 className="brandTitle">
              MỘC QUÁN <span className="brandSub">Cashier</span>
            </h1>
          </div>
          <div className="menuBadge" style={{ background: "#fff" }}>
            Thu ngân: Staff_02
          </div>
        </div>
        <div className="headerLine"></div>
      </header>

      <main
        className="customerMain"
        style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "24px" }}
      >
        {/* Cột trái: Hàng chờ thanh toán */}
        <div className="sectionCard" style={{ height: "fit-content" }}>
          <div className="menuHeader">
            <div className="menuHeaderLeft">
              <div className="menuSpark">🧾</div>
              <h2 className="menuTitle">Hàng chờ thanh toán</h2>
            </div>
            <span className="menuBadge">{requestingCount} yêu cầu</span>
          </div>

          {/* ✅ Chỉ hiển thị bàn REQUESTING_BILL */}
          {requestingCount === 0 ? (
            <div
              style={{
                marginTop: 14,
                padding: 16,
                borderRadius: 16,
                background: "rgba(255,255,255,0.7)",
                border: "1px dashed rgba(120, 53, 15, 0.25)",
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Chưa có bàn nào</div>
              <div className="menuDesc" style={{ margin: 0 }}>
                Nhân viên phục vụ bấm <b>“Yêu cầu tính tiền”</b> thì bàn sẽ xuất hiện ở đây.
              </div>
            </div>
          ) : (
            <div className="menuGrid" style={{ marginTop: 12 }}>
              {tables
                .filter((t) => t.status === "REQUESTING_BILL")
                .map((t) => (
                  <TableCard key={t.id} table={t} onClick={() => setSelectedTable(t)} />
                ))}
            </div>
          )}
        </div>

        {/* Cột phải: Panel thanh toán */}
        <section>
          {!selectedTable ? (
            <div className="sectionCard" style={{ textAlign: "center", padding: "50px" }}>
              <div className="menuSpark" style={{ margin: "0 auto 10px" }}>
                🧾
              </div>
              <p className="menuDesc">
                Chọn một bàn <b>(REQUESTING_BILL)</b> để tiến hành thanh toán.
              </p>
            </div>
          ) : (
            <BillPanel
              table={selectedTable}
              reloadTables={loadTables}
              onClose={() => setSelectedTable(null)}
            />
          )}
        </section>
      </main>
    </div>
  );
}
