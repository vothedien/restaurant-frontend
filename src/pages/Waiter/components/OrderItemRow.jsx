import { useMemo, useState } from "react";
import { deleteItem, updateItem } from "../../../api/waiter.api";

export default function OrderItemRow({
  item,
  orderId,
  reload,
  orderStatus,
  hideStatusSelect = false, // giữ để tương thích, draft đang hide
}) {
  const itemId = item.itemId ?? item.id;

  const itemName = useMemo(
    () => item.name || item.itemNameSnapshot || "Món không tên",
    [item]
  );

  const isLocked = orderStatus === "COMPLETED" || orderStatus === "CANCELED";

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
      }}
    >
      {/* Hàng 1: tên món + qty */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <b className="menuName" style={{ fontSize: 16 }}>{itemName}</b>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            className="menuBadge"
            disabled={isLocked || saving}
            onClick={decQty}
            style={{ padding: "6px 10px", background: "#fff", cursor: "pointer" }}
            title="Giảm"
          >
            −
          </button>

          <span className="menuBadge" style={{ fontSize: 12 }}>x{qty}</span>

          <button
            className="menuBadge"
            disabled={isLocked || saving}
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

        {/* ✅ X ngang hàng Save */}
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
    </div>
  );
}
