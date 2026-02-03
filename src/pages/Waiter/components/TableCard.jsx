export default function TableCard({ table, onClick, isSelected = false }) {
  const status = table.status;

  const styleByStatus = () => {
    if (status === "REQUESTING_BILL") return { bg: "var(--mq-orange)", fg: "#fff", pill: "rgba(255,255,255,0.28)" };
    if (status === "OCCUPIED") return { bg: "var(--mq-amber)", fg: "var(--mq-text)", pill: "rgba(255,255,255,0.45)" };
    if (status === "CLEANING") return { bg: "#10b981", fg: "#fff", pill: "rgba(255,255,255,0.28)" };
    return { bg: "#fff", fg: "var(--mq-text)", pill: "rgba(252,211,77,0.22)" }; // AVAILABLE
  };

  const s = styleByStatus();

  return (
    <div
      onClick={onClick}
      className="menuCard"
      style={{
        padding: "16px",
        textAlign: "center",
        cursor: "pointer",
        background: s.bg,
        borderRadius: 18,
        border: isSelected ? "2px solid #111827" : "1px solid rgba(252, 211, 77, 0.35)",
        boxShadow: isSelected ? "0 10px 25px rgba(0,0,0,0.12)" : "0 6px 18px rgba(0,0,0,0.06)",
        transform: isSelected ? "translateY(-1px)" : "translateY(0)",
        transition: "transform 120ms ease, box-shadow 120ms ease",
        minHeight: 92,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 8,
      }}
      title={`Bàn ${table.code} - ${status}`}
    >
      <div className="menuName" style={{ color: s.fg, fontSize: 22, letterSpacing: 0.5 }}>
        {table.code}
      </div>

      <div
        className="menuBadge"
        style={{
          margin: "0 auto",
          width: "fit-content",
          padding: "6px 10px",
          background: s.pill,
          border: "none",
          color: s.fg,
          fontSize: 12,
          borderRadius: 999,
        }}
      >
        {status}
      </div>
    </div>
  );
}
