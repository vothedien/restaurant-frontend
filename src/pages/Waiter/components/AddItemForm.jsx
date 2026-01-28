import { useEffect, useState } from "react";
import { getMenu, addOrderItem } from "../../../api/waiter.api";

export default function AddItemForm({ orderId, reload }) {
  const [menu, setMenu] = useState([]);
  const [menuItemId, setMenuItemId] = useState("");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  useEffect(() => {
    getMenu().then(setMenu).catch(console.error);
  }, []);

  async function submit() {
    if (!menuItemId) return alert("Vui lòng chọn món!");
    if (!orderId) return alert("Đơn hàng chưa được tạo!");

    try {
      await addOrderItem(orderId, { menuItemId, qty, note });
      // Reset form
      setQty(1); setNote("");
      // Reload danh sách món bên ngoài
      await reload();
    } catch (e) {
      alert("Lỗi thêm món: " + e.message);
    }
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <h3 className="menuName" style={{fontSize: '14px', marginBottom: '8px'}}>Thêm món mới</h3>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <select 
          className="menuBadge" style={{ flex: 1, border: "1px solid #fbbf24", padding: '8px' }}
          onChange={e => setMenuItemId(e.target.value)} value={menuItemId}
        >
          <option value="">-- Chọn món --</option>
          {menu.map(m => (
            <option key={m.id} value={m.id}>{m.name} ({m.price?.toLocaleString()}đ)</option>
          ))}
        </select>

        <input type="number" value={qty} min={1} onChange={e => setQty(e.target.value)}
          className="menuBadge" style={{ width: "60px", textAlign: "center", border: "1px solid #fbbf24" }} />

        <input placeholder="Ghi chú..." value={note} onChange={e => setNote(e.target.value)}
          className="menuDesc" style={{ flex: 1, padding: '8px', border: "1px solid #ddd", borderRadius: '8px' }} />

        <button onClick={submit} className="addBtn" style={{ width: "auto", padding: "0 20px" }}>Thêm</button>
      </div>
    </div>
  );
}