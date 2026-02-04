import React, { useMemo } from "react";
import ItemStatusSelectKitchen from "./ItemStatusSelectKitchen";
export default function KitchenItemRow({ item, orderId, reload }) {
  const normalizedItem = useMemo(() => {
    const id = item?.id ?? item?.itemId ?? item?.orderItemId;
    return { ...item, id };
  }, [item]);

  const itemName = useMemo(
    () => normalizedItem.name || normalizedItem.itemNameSnapshot || "Món không tên",
    [normalizedItem]
  );

  const qty = normalizedItem.qty ?? normalizedItem.quantity ?? 0;

 const missing = !orderId || !normalizedItem.id;


  return (
    <div className="kitchen-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px dashed #eee" }}>
      <div style={{ flex: 1, paddingRight: "15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: "700", fontSize: "16px", color: "#374151" }}>{itemName}</span>
          <span style={{ background: "#fff7ed", color: "#c2410c", border: "1px solid #ffedd5", padding: "2px 8px", borderRadius: "6px", fontSize: "13px", fontWeight: "800" }}>
            x{qty}
          </span>
        </div>

        {missing && (
          <div style={{ marginTop: 6, fontSize: 12, color: "#ef4444" }}>
            Thiếu {(!orderId ? "orderId" : "")}{(!orderId && !normalizedItem.id ? " & " : "")}{(!normalizedItem.id ? "itemId" : "")} nên chưa đổi trạng thái được.
          </div>
        )}
      </div>

      <div style={{ width: "150px", opacity: missing ? 0.5 : 1, pointerEvents: missing ? "none" : "auto" }}>
        <ItemStatusSelectKitchen item={item} orderId={orderId} reload={reload} />
      </div>
    </div>
  );
}
