import { useEffect, useState } from "react";
import { getPublicMenu } from "../../../api/public.api";
import { addItem } from "../../../api/waiter.api";

export default function AddItemForm({ orderId, reload, orderStatus }) {
  const [menu, setMenu] = useState([]);
  const [menuItemId, setMenuItemId] = useState("");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  useEffect(() => {
    getPublicMenu().then(setMenu).catch(console.error);
  }, []);

  const isLocked = orderStatus === "COMPLETED" || orderStatus === "CANCELED";

  async function submit() {
    if (isLocked) return;
    if (!menuItemId) return alert("Vui lòng chọn món!");
    if (!orderId) return alert("Chưa có orderId (bàn chưa có draft/active order)!");

    try {
      await addItem(orderId, {
        menuItemId: Number(menuItemId),
        qty: Number(qty),
        note: note?.trim() || "",
      });

      setMenuItemId("");
      setQty(1);
      setNote("");
      await reload();
    } catch (e) {
      alert("Lỗi thêm món: " + (e.response?.data?.message || e.message));
    }
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <h3 className="menuName" style={{ fontSize: "14px", marginBottom: "8px" }}>
        Thêm món mới
      </h3>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <select
          disabled={isLocked || !orderId}
          className="menuBadge"
          style={{ flex: 1, border: "1px solid #fbbf24", padding: "8px" }}
          onChange={(e) => setMenuItemId(e.target.value)}
          value={menuItemId}
        >
          <option value="">-- Chọn món --</option>
          {menu
            .filter((m) => m.isAvailable !== false)
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.price?.toLocaleString()}đ)
              </option>
            ))}
        </select>

        <input
          disabled={isLocked || !orderId}
          type="number"
          value={qty}
          min={1}
          onChange={(e) => setQty(e.target.value)}
          className="menuBadge"
          style={{
            width: "60px",
            textAlign: "center",
            border: "1px solid #fbbf24",
          }}
        />

        <input
          disabled={isLocked || !orderId}
          placeholder="Ghi chú..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="menuDesc"
          style={{
            flex: 1,
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        />

        <button
          disabled={isLocked || !orderId}
          onClick={submit}
          className="addBtn"
          style={{ width: "auto", padding: "0 20px" }}
        >
          Thêm
        </button>
      </div>
    </div>
  );
}
