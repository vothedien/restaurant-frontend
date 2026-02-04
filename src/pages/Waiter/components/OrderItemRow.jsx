/* eslint-disable no-unused-vars */
import { useMemo, useState } from "react";
import { deleteItem, updateItem } from "../../../api/waiter.api";
import ItemStatusSelect from "./ItemStatusSelect"; // ✅ Import component chọn trạng thái

export default function OrderItemRow({
  item,
  orderId,
  reload,
  orderStatus,
  hideStatusSelect = false, // ✅ True khi ở màn hình chọn món (Draft), False khi ở Active Panel
}) {
  const itemId = item.itemId ?? item.id;

  const itemName = useMemo(
    () => item.name || item.itemNameSnapshot || "Món không tên",
    [item]
  );

  const isLocked = orderStatus === "COMPLETED" || orderStatus === "CANCELED";
  
  // Logic hiển thị Badge màu sắc cho trạng thái (dùng để hiển thị text nếu không dùng dropdown)
  const statusColor = item.status === "READY" ? "#16a34a" : item.status === "COOKING" ? "#ea580c" : "#666";

  const [qty, setQty] = useState(Number(item.qty || 1));
  const [note, setNote] = useState(item.note || "");
  const [saving, setSaving] = useState(false);

  const save = async (next) => {
    if (!orderId) return alert("Thiếu orderId!");
    if (!itemId) return alert("Thiếu itemId!");
    if (isLocked) return;

    setSaving(true);
    try {
      await updateItem(orderId, itemId, {
        qty: Number(next.qty),
        note: (next.note ?? "").trim(),
      });
      await reload();
    } catch (e) {
      alert("Lỗi cập nhật món: " + (e.response?.data?.message || e.message));
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const decQty = async () => {
    const next = Math.max(1, qty - 1);
    setQty(next);
    await save({ qty: next, note });
  };

  const incQty = async () => {
    const next = qty + 1;
    setQty(next);
    await save({ qty: next, note });
  };

  const handleSaveNote = async () => {
    await save({ qty, note });
  };

  const handleDelete = async () => {
    if (!orderId) return alert("Thiếu orderId!");
    if (!itemId) return alert("Thiếu itemId!");
    if (isLocked) return;

    if (window.confirm(`Xóa món "${itemName}"?`)) {
      await deleteItem(orderId, itemId);
      await reload();
    }
  };

  return (
    <div
      style={{
        padding: "12px 0",
        borderBottom: "1px dashed rgba(120, 53, 15, 0.18)",
        backgroundColor: item.status === "CANCELED" ? "#fef2f2" : "transparent" // Highlight nhẹ nếu bị hủy
      }}
    >
      {/* Hàng 1: tên món + qty */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{display: 'flex', flexDirection: 'column'}}>
            <b className="menuName" style={{ fontSize: 16, textDecoration: item.status === "CANCELED" ? "line-through" : "none" }}>
                {itemName}
            </b>
            {/* Nếu đang hideStatusSelect (Draft) thì không hiện status text ở đây */}
            {!hideStatusSelect && item.status && (
                <span style={{fontSize: 11, color: statusColor, fontWeight: 600}}>
                    {item.status}
                </span>
            )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Chỉ cho sửa số lượng nếu chưa SERVED/CANCELED hoặc tuỳ logic nhà hàng */}
          <button
            className="menuBadge"
            disabled={isLocked || saving || item.status === "CANCELED" || item.status === "SERVED"}
            onClick={decQty}
            style={{ padding: "6px 10px", background: "#fff", cursor: "pointer" }}
            title="Giảm"
          >
            −
          </button>

          <span className="menuBadge" style={{ fontSize: 12 }}>x{qty}</span>

          <button
            className="menuBadge"
            disabled={isLocked || saving || item.status === "CANCELED" || item.status === "SERVED"}
            onClick={incQty}
            style={{ padding: "6px 10px", background: "#fff", cursor: "pointer" }}
            title="Tăng"
          >
            +
          </button>
        </div>
      </div>

      {/* Hàng 2: note + Save + X (cùng hàng) */}
      <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
        <input
          disabled={isLocked || saving}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú..."
          className="menuDesc"
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: 10,
            minWidth: 0,
          }}
        />

        <button
          disabled={isLocked || saving}
          onClick={handleSaveNote}
          className="menuBadge"
          style={{
            padding: "8px 12px",
            border: "1px solid rgba(252, 211, 77, 0.6)",
            background: "#fff",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Save
        </button>

        <button
          onClick={handleDelete}
          disabled={isLocked || saving}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "1px solid rgba(220, 38, 38, 0.25)",
            background: "#fff",
            color: isLocked ? "#9ca3af" : "#dc2626",
            cursor: isLocked ? "not-allowed" : "pointer",
            fontSize: 18,
            fontWeight: 800,
            lineHeight: "36px",
          }}
          title={isLocked ? "Đơn đã khóa" : "Xóa món"}
        >
          ✕
        </button>
      </div>

      {/* ✅ Hàng 3: SELECT TRẠNG THÁI (Chỉ hiện khi Order Active) */}
      {!hideStatusSelect && (
        <div style={{ marginTop: 12, paddingTop: 8, borderTop: "1px dotted #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{fontSize: 12, color: "#888", fontStyle: "italic"}}>Cập nhật bếp:</span>
            
            {/* Component Status Select */}
            <div style={{ width: "140px" }}>
                <ItemStatusSelect 
                    item={item} 
                    orderId={orderId} 
                    reload={reload} 
                    disabled={isLocked}
                />
            </div>
        </div>
      )}
    </div>
  );
}