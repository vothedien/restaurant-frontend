/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import TablesPanel from "./components/TablesPanel";
import ActiveOrderPanel from "./components/ActiveOrderPanel";
import { getTables, openTable } from "../../api/waiter.api";

export default function WaiterPage() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);

  const loadTables = useCallback(async () => {
    try {
      const data = await getTables();
      console.log("Dữ liệu Tables:", data);
      setTables(data);
      // Cập nhật lại thông tin bàn đang chọn nếu có thay đổi
      if (selectedTable) {
        const updated = data.find(t => t.id === selectedTable.id);
        setSelectedTable(updated);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách bàn:", error);
    }
  }, [selectedTable]);

  useEffect(() => { loadTables(); }, []);

  const handleOpenTable = async (id) => {
    await openTable(id);
    await loadTables();
  };

  return (
    <div className="customerPage">
      <header className="customerHeader">
        <div className="customerHeaderInner">
          <div className="brandLeft">
            <div className="brandIcon">🍽️</div>
            <h1 className="brandTitle">MỘC QUÁN <span className="brandSub">Waiter</span></h1>
          </div>
          <div className="menuBadge" style={{background: '#fff'}}>Staff_01</div>
        </div>
        <div className="headerLine"></div>
      </header>

      <main className="customerMain" style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px' }}>
        {/* Cột trái: Sơ đồ bàn */}
        <aside>
          <TablesPanel tables={tables} onSelect={setSelectedTable} reload={loadTables} />
        </aside>

        {/* Cột phải: Khu vực thao tác */}
        <section>
          {!selectedTable ? (
            <div className="sectionCard" style={{ textAlign: 'center', padding: '50px' }}>
              <p className="menuDesc">👈 Chọn một bàn để bắt đầu phục vụ</p>
            </div>
          ) : (
            <>
              {/* Nếu bàn trống: Hiện nút Mở bàn */}
              {selectedTable.status === "AVAILABLE" && (
                <div className="sectionCard" style={{ textAlign: 'center', padding: '40px' }}>
                  <h2 className="menuTitle" style={{ marginBottom: '20px' }}>Bàn {selectedTable.code} đang trống</h2>
                  <button className="addBtn" onClick={() => handleOpenTable(selectedTable.id)}>
                    Mở bàn (Open Table)
                  </button>
                </div>
              )}

              {/* Nếu bàn có khách hoặc đang dọn dẹp: Hiện bảng Order */}
              {selectedTable.status !== "AVAILABLE" && (
                <ActiveOrderPanel table={selectedTable} reloadTables={loadTables} />
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}