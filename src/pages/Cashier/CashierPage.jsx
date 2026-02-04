import { useEffect, useState, useCallback, useRef } from "react";
import { getTables } from "../../api/cashier.api";
import TableCard from "../Waiter/components/TableCard";
import BillPanel from "./components/BillPanel";
import KitchenPanel from "./components/KitchenPanel"; 

export default function CashierPage() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  
  const selectedTableRef = useRef(selectedTable);

  useEffect(() => {
    selectedTableRef.current = selectedTable;
  }, [selectedTable]);

  const loadTables = useCallback(async () => {
    try {
      const data = await getTables();
      setTables(data);

      const currentSelected = selectedTableRef.current;
      if (currentSelected) {
        const updated = data.find((t) => t.id === currentSelected.id);
        if (updated && JSON.stringify(updated) !== JSON.stringify(currentSelected)) {
             setSelectedTable(updated);
        } else if (!updated) {
            setSelectedTable(null);
        }
      }
    } catch (error) {
      console.error("Lỗi tải sơ đồ bàn:", error);
    }
  }, []);

  useEffect(() => {
    loadTables();
    const interval = setInterval(() => {
        loadTables();
    }, 5000); 
    return () => clearInterval(interval);
  }, [loadTables]);

  const requestingCount = tables.filter((t) => t.status === "REQUESTING_BILL").length;
  const occupiedCount = tables.filter((t) => t.status === "OCCUPIED").length;

  // ✅ Hàm quyết định hiển thị Panel bên phải
  const renderRightPanel = () => {
    if (!selectedTable) {
      return (
        <div className="sectionCard" style={{ textAlign: "center", padding: "50px" }}>
          <div className="menuSpark" style={{ margin: "0 auto 10px", fontSize: 40 }}>
            🏪
          </div>
          <p className="menuDesc" style={{fontSize: 16}}>
            Chào mừng quay lại!<br/>
            Vui lòng chọn bàn bên trái để xem chi tiết.
          </p>
        </div>
      );
    }

    // Trường hợp 1: Khách gọi tính tiền -> Hiện BillPanel
    if (selectedTable.status === "REQUESTING_BILL") {
      return (
        <BillPanel
          table={selectedTable}
          reloadTables={loadTables}
          onClose={() => setSelectedTable(null)}
        />
      );
    }

    // Trường hợp 2: Khách đang ăn -> Hiện KitchenPanel (Quản lý món)
    if (selectedTable.status === "OCCUPIED") {
      return (
        <KitchenPanel
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
        />
      );
    }

    // Trường hợp khác (Available, Cleaning...) -> Chỉ hiện thông tin cơ bản
    return (
        <div className="sectionCard p-10 text-center">
            <h3 className="text-xl font-bold mb-2">Bàn {selectedTable.code}</h3>
            <span className="menuBadge">{selectedTable.status}</span>
            <button onClick={() => setSelectedTable(null)} className="block mx-auto mt-6 text-blue-500 underline">Đóng</button>
        </div>
    );
  };

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
        {/* === CỘT TRÁI: DANH SÁCH BÀN === */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", height: "fit-content" }}>
          
          {/* PHẦN 1: HÀNG CHỜ THANH TOÁN */}
          <div className="sectionCard">
            <div className="menuHeader">
              <div className="menuHeaderLeft">
                <div className="menuSpark">🧾</div>
                <h2 className="menuTitle">Hàng chờ thanh toán</h2>
              </div>
              <span className="menuBadge" style={{background: requestingCount > 0 ? '#fee2e2' : '#f3f4f6', color: requestingCount > 0 ? '#ef4444' : '#6b7280'}}>
                {requestingCount} yêu cầu
              </span>
            </div>

            {requestingCount === 0 ? (
              <div
                style={{
                  marginTop: 14, padding: 16, borderRadius: 16,
                  background: "rgba(255,255,255,0.7)", border: "1px dashed rgba(120, 53, 15, 0.25)",
                  textAlign: "center", lineHeight: 1.4,
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 6, color: "#888" }}>Trống</div>
                <div className="menuDesc" style={{ margin: 0, fontSize: 12 }}>Chưa có yêu cầu thanh toán nào.</div>
              </div>
            ) : (
              <div className="menuGrid" style={{ marginTop: 12 }}>
                {tables.filter((t) => t.status === "REQUESTING_BILL").map((t) => (
                    <TableCard 
                      key={t.id} table={t} 
                      isActive={selectedTable?.id === t.id}
                      onClick={() => setSelectedTable(t)} 
                    />
                ))}
              </div>
            )}
          </div>

          {/* PHẦN 2: BÀN ĐANG PHỤC VỤ */}
          <div className="sectionCard">
            <div className="menuHeader">
              <div className="menuHeaderLeft">
                <div className="menuSpark">🍲</div>
                <h2 className="menuTitle">Bàn đang phục vụ</h2>
              </div>
              <span className="menuBadge">{occupiedCount} bàn</span>
            </div>

            {occupiedCount === 0 ? (
               <div className="menuDesc" style={{ textAlign: "center", padding: "20px" }}>Hiện không có khách.</div>
            ) : (
              <div className="menuGrid" style={{ marginTop: 12 }}>
                {tables.filter((t) => t.status === "OCCUPIED").map((t) => (
                    <TableCard 
                      key={t.id} table={t} 
                      isActive={selectedTable?.id === t.id}
                      onClick={() => setSelectedTable(t)} 
                    />
                ))}
              </div>
            )}
          </div>

        </div> 

        {/* === CỘT PHẢI: DYNAMIC PANEL === */}
        <section>
          {renderRightPanel()}
        </section>
      </main>
    </div>
  );
}