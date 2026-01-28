import { useEffect, useState, useCallback } from "react";
import {
  getDraftByTable,
  confirmOrder
} from "../../../api/waiter.api";
import AddItemForm from "./AddItemForm";
import OrderItemRow from "./OrderItemRow";

export default function DraftOrderPanel({ table, reloadTables }) {
  const [draft, setDraft] = useState(null);

  // Dùng useCallback để tránh render vòng lặp và tối ưu hiệu năng
  const load = useCallback(async () => {
    const data = await getDraftByTable(table.id);
    setDraft(data);
  }, [table.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirm() {
    if (!draft?.id) return;
    await confirmOrder(draft.id);
    await reloadTables();
  }

  return (
    <div className="sectionCard">
      {/* Header Panel */}
      <div className="menuHeader">
        <div className="menuHeaderLeft">
          <div className="menuSpark">
             <span style={{ color: 'white', fontWeight: '900' }}>!</span>
          </div>
          <h2 className="menuTitle">Đơn tạm tính: {table.id}</h2>
        </div>
        {draft && <span className="menuBadge">Mã đơn: #{draft.id}</span>}
      </div>

      {/* Danh sách món ăn */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '15px 0' }}>
        {draft?.items?.map(it => (
          <OrderItemRow key={it.id} item={it} orderId={draft.id} reload={load} />
        ))}
      </div>

      {/* Form thêm món */}
      <div style={{ borderTop: '1px dashed rgba(120, 53, 15, 0.2)', paddingTop: '15px' }}>
        <AddItemForm orderId={draft?.id} reload={load} />
      </div>

      {/* Nút xác nhận - Dùng style addBtn nhưng đổi màu nhấn mạnh */}
      <button
        onClick={confirm}
        className="addBtn"
        style={{ 
          marginTop: '20px', 
          background: 'var(--mq-brown)', // Dùng màu nâu đặc trưng của quán
          boxShadow: '0 10px 20px rgba(92, 64, 51, 0.2)' 
        }}
      >
        Xác nhận gửi đơn (Confirm)
      </button>
    </div>
  );
}