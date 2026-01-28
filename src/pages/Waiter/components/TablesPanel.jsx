import TableCard from "./TableCard";

export default function TablesPanel({ tables, onSelect }) {
  return (
    <div className="customerMain" style={{ marginTop: '0', maxWidth: '100%' }}>
      {/* Tiêu đề danh sách bàn - Tận dụng style menuHeader */}
      <div className="menuHeader">
        <div className="menuHeaderLeft">
          <div className="menuSpark">
            <span style={{ color: "white", fontWeight: "bold" }}>🏢</span>
          </div>
          <h2 className="menuTitle">Sơ đồ bàn</h2>
        </div>
        <span className="menuBadge">Tổng: {tables.length} bàn</span>
      </div>

      {/* Lưới danh sách bàn sử dụng class menuGrid có sẵn để tự động chia cột */}
      <div className="menuGrid" style={{ marginTop: '10px' }}>
        {tables.map(t => (
          <TableCard 
            key={t.id} 
            table={t} 
            onClick={() => onSelect(t)} 
          />
        ))}
      </div>
      
      {/* Đường gạch phân cách cuối danh sách */}
      <div className="headerLine" style={{ marginTop: '30px', opacity: 0.3 }}></div>
    </div>
  );
}