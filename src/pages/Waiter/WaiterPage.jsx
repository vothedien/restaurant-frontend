import { useEffect, useState, useCallback } from "react";
import TablesPanel from "./components/TablesPanel";
import ActiveOrderPanel from "./components/ActiveOrderPanel";
import DraftOrderPanel from "./components/DraftOrderPanel";
import { getTables, openTable } from "../../api/waiter.api";

export default function WaiterPage() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);

  const loadTables = useCallback(async () => {
    try {
      const data = await getTables();
      setTables(data || []);

      // update lại bàn đang chọn để UI luôn mới
      if (selectedTable?.id) {
        const updated = (data || []).find((t) => t.id === selectedTable.id) || null;
        setSelectedTable(updated);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách bàn:", error);
    }
  }, [selectedTable?.id]);

  // load lần đầu + auto refresh
  useEffect(() => {
    loadTables();

    const interval = setInterval(loadTables, 3000);
    return () => clearInterval(interval);
  }, [loadTables]);

  // refresh khi quay lại tab
  useEffect(() => {
    const onFocus = () => loadTables();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadTables]);

  const handleOpenTable = async (id) => {
    await openTable(id);
    await loadTables();
  };

  const renderRightPanel = () => {
    if (!selectedTable) {
      return (
        <div className="sectionCard" style={{ textAlign: "center", padding: "50px" }}>
          <p className="menuDesc">👈 Chọn một bàn để bắt đầu phục vụ</p>
        </div>
      );
    }

    // AVAILABLE -> mở bàn
    if (selectedTable.status === "AVAILABLE") {
      return (
        <div className="sectionCard" style={{ textAlign: "center", padding: "40px" }}>
          <h2 className="menuTitle" style={{ marginBottom: "20px" }}>
            Bàn {selectedTable.code} đang trống
          </h2>
          <button className="addBtn" onClick={() => handleOpenTable(selectedTable.id)}>
            Mở bàn (Open Table)
          </button>
        </div>
      );
    }

    // Nếu có currentOrderId -> đang có order ACTIVE/REQUESTING_BILL/CLEANING...
    // Nhưng vẫn có thể tồn tại draft (tuỳ backend), nên ưu tiên: nếu table có draft thì show Draft
    // Cách đơn giản: nếu status OCCUPIED mà chưa có currentOrderId -> show Draft (customer submit)
    if (selectedTable.status === "OCCUPIED" && !selectedTable.currentOrderId) {
      return <DraftOrderPanel table={selectedTable} reloadTables={loadTables} />;
    }

    return <ActiveOrderPanel table={selectedTable} reloadTables={loadTables} />;
  };

  return (
    <div className="customerPage">
      <header className="customerHeader">
        <div className="customerHeaderInner">
          <div className="brandLeft">
            <div className="brandIcon">🍽️</div>
            <h1 className="brandTitle">
              MỘC QUÁN <span className="brandSub">Waiter</span>
            </h1>
          </div>
          <div className="menuBadge" style={{ background: "#fff" }}>
            Staff_01
          </div>
        </div>
        <div className="headerLine"></div>
      </header>

      <main
        className="customerMain"
        style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "24px" }}
      >
        <aside>
          <TablesPanel tables={tables} onSelect={setSelectedTable} />
        </aside>

        <section>{renderRightPanel()}</section>
      </main>
    </div>
  );
}
