import TableCard from "./TableCard";

export default function TablesPanel({ tables, onSelect, selectedTableId }) {
  return (
    <div className="customerMain" style={{ marginTop: "0", maxWidth: "100%" }}>
      <div className="menuHeader">
        <div className="menuHeaderLeft">
          <div className="menuSpark">
            <span style={{ color: "white", fontWeight: "bold" }}>🏢</span>
          </div>
          <h2 className="menuTitle">Sơ đồ bàn</h2>
        </div>
        <span className="menuBadge">Tổng: {tables.length} bàn</span>
      </div>

      <div className="menuGrid" style={{ marginTop: "10px" }}>
        {tables.map((t) => (
          <TableCard
            key={t.id}
            table={t}
            isSelected={t.id === selectedTableId}
            onClick={() => onSelect(t)}
          />
        ))}
      </div>

      <div className="headerLine" style={{ marginTop: "30px", opacity: 0.3 }}></div>
    </div>
  );
}
