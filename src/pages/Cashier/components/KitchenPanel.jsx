import { useEffect, useState, useCallback } from "react";
import { getOrder } from "../../../api/waiter.api";
import KitchenItemRow from "./KitchenItemRow";

export default function KitchenPanel({ table, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const effectiveOrderId = table?.currentOrderId ?? order?.id; 

  const loadOrder = useCallback(async () => {
    if (!table?.currentOrderId) return;
    setLoading(true);
    try {
      const data = await getOrder(table.currentOrderId);
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [table?.currentOrderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const items = order?.items || [];
  const pendingCount = items.filter(i => i.status === "PENDING").length;
  const cookingCount = items.filter(i => i.status === "COOKING").length;

  if (!table?.currentOrderId) {
    return (
      <div className="sectionCard p-10 text-center">
        Trống
        <button onClick={onClose}>Đóng</button>
      </div>
    );
  }

  return (
    <div className="sectionCard" style={{ height: "100%", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
      {/* header */}
      <div className="menuHeader" style={{ padding: "20px", borderBottom: "1px solid #eee" }}>
        <div className="menuHeaderLeft">
          <div className="menuSpark">🔥</div>
          <div>
            <h2 className="menuTitle">Bếp: {table.code}</h2>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
              Order #{effectiveOrderId ?? "—"}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: "8px", padding: "8px 12px", cursor: "pointer" }}>✕</button>
      </div>

      {/* thống kê */}
      <div style={{ padding: "10px 20px", display: "flex", gap: 10, background: "#fafafa", borderBottom: "1px dashed #ddd" }}>
        <span className="menuBadge" style={{ background: "#e0f2fe", color: "#0284c7" }}>Chờ: {pendingCount}</span>
        <span className="menuBadge" style={{ background: "#ffedd5", color: "#ea580c" }}>Nấu: {cookingCount}</span>
      </div>

      {/* list món */}
      <div className="custom-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#999" }}>Đang tải...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", color: "#999" }}>Không có món.</div>
        ) : (
          items.map((item) => (
            <KitchenItemRow
              key={item.id ?? item.itemId ?? item.orderItemId}
              item={item}
              orderId={effectiveOrderId}   // 
              reload={loadOrder}
            />
          ))
        )}
      </div>

      {/* footer */}
      <div style={{ padding: "15px 20px", borderTop: "2px solid #eee", background: "#fff", display: "flex", justifyContent: "space-between" }}>
        <span className="menuDesc">Tổng: <b>{items.length}</b></span>
        <button onClick={loadOrder} className="menuBadge" style={{ background: "#fff", border: "1px solid #ddd", cursor: "pointer" }}>🔄 Refresh</button>
      </div>
    </div>
  );
}
