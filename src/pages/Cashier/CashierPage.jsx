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
      
      // Update lại bàn đang chọn để dữ liệu luôn mới
      if (selectedTable) {
        const updated = data.find(t => t.id === selectedTable.id);
        setSelectedTable(updated);
      }
    } catch (error) {
      console.error("Lỗi tải sơ đồ bàn:", error);
    }
  }, [selectedTable]);

  useEffect(() => {
    loadTables();
    // Có thể set interval để auto-refresh mỗi 10s nếu muốn
    const interval = setInterval(loadTables, 10000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="customerPage">
      {/* Header Cashier - Màu nâu đặc trưng */}
      <header className="customerHeader">
        <div className="customerHeaderInner">
          <div className="brandLeft">
            <div className="brandIcon">💰</div>
            <h1 className="brandTitle">MỘC QUÁN <span className="brandSub">Cashier</span></h1>
          </div>
          <div className="menuBadge" style={{background: '#fff'}}>Thu ngân: Staff_02</div>
        </div>
        <div className="headerLine"></div>
      </header>

      <main className="customerMain" style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px' }}>
        {/* Cột trái: Sơ đồ bàn */}
        <div className="sectionCard" style={{ height: 'fit-content' }}>
          <div className="menuHeader">
            <h2 className="menuTitle">Hàng chờ thanh toán</h2>
            <span className="menuBadge">{tables.filter(t => t.status === 'REQUESTING_BILL').length} yêu cầu</span>
          </div>
          
          <div className="menuGrid">
            {tables.map(t => (
              <TableCard 
                key={t.id} 
                table={t} 
                onClick={() => setSelectedTable(t)} 
              />
            ))}
          </div>
        </div>

        {/* Cột phải: Panel thanh toán */}
        <section>
          {!selectedTable ? (
            <div className="sectionCard" style={{ textAlign: 'center', padding: '50px' }}>
              <div className="menuSpark" style={{ margin: '0 auto 10px' }}>🧾</div>
              <p className="menuDesc">Chọn một bàn để tiến hành thanh toán.</p>
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